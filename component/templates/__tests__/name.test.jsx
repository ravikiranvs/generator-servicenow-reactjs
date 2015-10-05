var ReactWithAddons = require('react/addons');
var TestUtils = ReactWithAddons.addons.TestUtils;

var <%= (name) %> = require('../<%= (name) %>');

describe('<%= (name) %>', function() {
    it('<%= (name) %> should render', function() {
        var data = "Test data";

        var <%= (name) %>DOM = TestUtils.renderIntoDocument(<<%= (name) %> data={data}></<%= (name) %>>);
        <%= (name) %>DOM = ReactWithAddons.findDOMNode(<%= (name) %>DOM);

        expect(<%= (name) %>DOM.innerText).toEqual(data);
    });
});