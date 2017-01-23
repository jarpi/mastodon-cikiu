import { connect } from 'react-redux';
import { closeModal } from '../../../actions/modal';
import Lightbox from '../../../components/lightbox';
import ImageLoader from 'react-imageloader';
import LoadingIndicator from '../../../components/loading_indicator';
import PureRenderMixin from 'react-addons-pure-render-mixin';

const mapStateToProps = state => ({
  url: state.getIn(['modal', 'url']),
  isVisible: state.getIn(['modal', 'open'])
});

const mapDispatchToProps = dispatch => ({
  onCloseClicked () {
    dispatch(closeModal());
  },

  onOverlayClicked () {
    dispatch(closeModal());
  }
});

const imageStyle = {
  display: 'block',
  maxWidth: '80vw',
  maxHeight: '80vh'
};

const loadingStyle = {
  background: '#373b4a',
  width: '400px',
  paddingBottom: '120px'
};

const preloader = () => (
  <div style={loadingStyle}>
    <LoadingIndicator />
  </div>
);

const Modal = React.createClass({

  propTypes: {
    url: React.PropTypes.string,
    isVisible: React.PropTypes.bool,
    onCloseClicked: React.PropTypes.func,
    onOverlayClicked: React.PropTypes.func
  },

  mixins: [PureRenderMixin],

  render () {
    const { url, ...other } = this.props;

    return (
      <Lightbox {...other}>
        <ImageLoader
          src={url}
          preloader={preloader}
          imgProps={{ style: imageStyle }}
        />
      </Lightbox>
    );
  }

});

export default connect(mapStateToProps, mapDispatchToProps)(Modal);
