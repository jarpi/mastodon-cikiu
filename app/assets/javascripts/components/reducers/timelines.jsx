import { TIMELINE_SET, TIMELINE_UPDATE, TIMELINE_DELETE } from '../actions/timelines';
import { REBLOG_SUCCESS, FAVOURITE_SUCCESS }              from '../actions/interactions';
import { ACCOUNT_SET_SELF, ACCOUNT_FETCH_SUCCESS }        from '../actions/accounts';
import { STATUS_FETCH_SUCCESS }                           from '../actions/statuses';
import Immutable                                          from 'immutable';

const initialState = Immutable.Map({
  home: Immutable.List([]),
  mentions: Immutable.List([]),
  statuses: Immutable.Map(),
  accounts: Immutable.Map(),
  me: null,
  ancestors: Immutable.Map(),
  descendants: Immutable.Map()
});

function statusToMaps(state, status) {
  // Separate account
  let account = status.get('account');
  status = status.set('account', account.get('id'));

  // Separate reblog, repeat for reblog
  let reblog = status.get('reblog');

  if (reblog !== null) {
    status = status.set('reblog', reblog.get('id'));
    state  = statusToMaps(state, reblog);
  }

  return state.withMutations(map => {
    map.setIn(['accounts', account.get('id')], account);
    map.setIn(['statuses', status.get('id')], status);
  });
};

function timelineToMaps(state, timeline, statuses) {
  statuses.forEach((status, i) => {
    state = statusToMaps(state, status);
    state = state.setIn([timeline, i], status.get('id'));
  });

  return state;
};

function updateTimelineWithMaps(state, timeline, status) {
  state = statusToMaps(state, status);
  state = state.update(timeline, list => list.unshift(status.get('id')));

  return state;
};

function deleteStatus(state, id) {
  ['home', 'mentions'].forEach(function (timeline) {
    state = state.update(timeline, list => list.filterNot(item => item === id));
  });

  return state.deleteIn(['statuses', id]);
};

function accountToMaps(state, account) {
  return state.setIn(['accounts', account.get('id')], account);
};

function contextToMaps(state, status, ancestors, descendants) {
  state = statusToMaps(state, status);

  let ancestorsIds = ancestors.map(ancestor => {
    state = statusToMaps(state, ancestor);
    return ancestor.get('id');
  });

  let descendantsIds = descendants.map(descendant => {
    state = statusToMaps(state, descendant);
    return descendant.get('id');
  });

  return state.withMutations(map => {
    map.setIn(['ancestors', status.get('id')], ancestorsIds);
    map.setIn(['descendants', status.get('id')], descendantsIds);
  });
};

export default function timelines(state = initialState, action) {
  switch(action.type) {
    case TIMELINE_SET:
      return timelineToMaps(state, action.timeline, Immutable.fromJS(action.statuses));
    case TIMELINE_UPDATE:
      return updateTimelineWithMaps(state, action.timeline, Immutable.fromJS(action.status));
    case TIMELINE_DELETE:
      return deleteStatus(state, action.id);
    case REBLOG_SUCCESS:
    case FAVOURITE_SUCCESS:
      return statusToMaps(state, Immutable.fromJS(action.response));
    case ACCOUNT_SET_SELF:
      return state.withMutations(map => {
        map.setIn(['accounts', action.account.id], Immutable.fromJS(action.account));
        map.set('me', action.account.id);
      });
    case ACCOUNT_FETCH_SUCCESS:
      return accountToMaps(state, Immutable.fromJS(action.account));
    case STATUS_FETCH_SUCCESS:
      return contextToMaps(state, Immutable.fromJS(action.status), Immutable.fromJS(action.context.ancestors), Immutable.fromJS(action.context.descendants));
    default:
      return state;
  }
};
