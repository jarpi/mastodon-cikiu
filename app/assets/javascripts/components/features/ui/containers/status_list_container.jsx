import { connect }           from 'react-redux';
import StatusList            from '../../../components/status_list';
import { replyCompose }      from '../../../actions/compose';
import { reblog, favourite } from '../../../actions/interactions';
import { expandTimeline }    from '../../../actions/timelines';
import { selectStatus }      from '../../../reducers/timelines';
import { deleteStatus }      from '../../../actions/statuses';

const mapStateToProps = function (state, props) {
  return {
    statuses: state.getIn(['timelines', props.type]).map(id => selectStatus(state, id)),
    me: state.getIn(['timelines', 'me'])
  };
};

const mapDispatchToProps = function (dispatch, props) {
  return {
    onReply (status) {
      dispatch(replyCompose(status));
    },

    onFavourite (status) {
      dispatch(favourite(status));
    },

    onReblog (status) {
      dispatch(reblog(status));
    },

    onScrollToBottom () {
      dispatch(expandTimeline(props.type));
    },

    onDelete (status) {
      dispatch(deleteStatus(status.get('id')));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatusList);
