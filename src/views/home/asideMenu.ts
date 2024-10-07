export default () => {
	return <Array<import('@/components/AsideMenu').MenuItem>>[
		{
			title: 'Home',
			children: [
				{
					title: 'Child 1',
					route: { name: 'Child-one' },
				},
				{
					title: 'Child 2',
					route: { name: 'Child-two' },
				},
			],
		},
	];
};
