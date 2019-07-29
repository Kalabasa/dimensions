import Vue from 'vue';
import VueConstants from 'vue-constants';

import App from 'ui/App';

Vue.use(VueConstants);

const requireComponent = require.context('./ui', true, /\.vue$/);

requireComponent.keys().forEach(fileName => {
	const componentConfig = requireComponent(fileName);
	const componentName = fileName
		.split('/')
		.pop()
		.replace(/\.\w+$/, '');

	Vue.component(componentName, componentConfig.default || componentConfig);
});

new Vue({
	el: '#app',
	render: createElement => createElement(App)
});
