import ColumnHeader    from './column_header';
import PureRenderMixin from 'react-addons-pure-render-mixin';

const Column = React.createClass({

  propTypes: {
    heading: React.PropTypes.string,
    icon: React.PropTypes.string
  },

  mixins: [PureRenderMixin],

  handleHeaderClick () {
    let node = ReactDOM.findDOMNode(this);
    node.querySelector('.scrollable').scrollTo(0, 0);
  },

  render () {
    let header = '';

    if (this.props.heading) {
      header = <ColumnHeader icon={this.props.icon} type={this.props.heading} onClick={this.handleHeaderClick} />;
    }

    return (
      <div style={{ width: '380px', flex: '0 0 auto', background: '#282c37', margin: '10px', marginRight: '0', display: 'flex', flexDirection: 'column' }}>
        {header}
        {this.props.children}
      </div>
    );
  }

});

export default Column;
