var <%= (name) %> = React.createClass({
	render: function() {
		return (
			<h2 className="<%= (name) %>">{this.props.data}</h2>
		);
	}
});

module.exports = <%= (name) %>;