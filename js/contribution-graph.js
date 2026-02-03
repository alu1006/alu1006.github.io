// source/js/contribution-graph.js

document.addEventListener('DOMContentLoaded', function() {

    const posts = window.HexoData.posts;
    console.log(posts)
    const formattedData = posts.reduce((acc, post) => {
        const date = post.date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const data = Object.entries(formattedData).map(([date, count]) => [date, count]);

    const chart = echarts.init(document.getElementById('main'));
    const option = {
        tooltip: {
            position: 'top'
        },
        visualMap: {
            min: 0,
            max: Math.max(...Object.values(formattedData)),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
        },
        calendar: {
            top: 'middle',
            left: 'center',
            orient: 'horizontal',
            cellSize: ['auto', 20],
            range: new Date().getFullYear(),
            itemStyle: {
                borderWidth: 0.5
            },
            yearLabel: { show: false },
            monthLabel: { nameMap: 'cn' },
            dayLabel: { firstDay: 1, nameMap: 'cn' }
        },
        series: [{
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data
        }]
    };

    chart.setOption(option);
});