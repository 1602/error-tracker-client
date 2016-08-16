
import React from 'react';

const Explore = React.createClass({

    propTypes: {
        data: React.PropTypes.object
    },

    getInitialState() {
        return { expanded: {} };
    },

    canExpand(key) {
        return typeof this.props.data[key] === 'object';
    },

    toggle(key) {
        const upd = {};
        upd[key] = !this.state.expanded[key];
        this.setState({
            expanded: Object.assign({}, this.state.expanded, upd)
        });
    },

    render() {
        if (!this.props.data) {
            return null;
        }

        const keys = Object.keys(this.props.data);

        return (
            <div className="explore-data">
                <ul className="structure">
                    {keys.map((key, index) => (
                        <li key={index} className={this.canExpand(key) ? 'expandable' : ''}>
                            <div className={`line ${this.state.expanded[index] ? 'expanded' : ''}`}>
                                <strong className="index">{key}: </strong>
                                <span className="value" onClick={
                                    () => this.toggle(key)
                                }>{inspect(this.props.data[key])}</span>
                                {this.state.expanded[key] ? (<Explore data={this.props.data[key]} />) : ''}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
});

function inspect(obj) {
    if (typeof obj === 'object' && obj) {
        return `Object(${Object.keys(obj).join(', ')})`;
    }

    return obj;
}

export default Explore;
