// JavaScript
define( [], function () {
	'use strict';

	var circles = {
		ref: "props.circles",
		label: "Точки",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: false
	};

 var values = {
	 ref: "props.values",
	 label: "Значения",
	 type: "boolean",
	 component: "switch",

	 options: [{
		 value: true,
		 label: "On"
	 }, {
		 value: false,
		 label: "OFF"
	 }],
	 defaultValue: false
 };


 var barFontWeight = {
	ref: "props.barFontWeight",
	label: "Жирный шрифт",
	type: "boolean",
	component: "switch",

	options: [{
		value: true,
		label: "On"
	}, {
		value: false,
		label: "OFF"
	}],
	defaultValue: false
 };

 var lineFontWeight = {
 ref: "props.lineFontWeight",
 label: "Жирный шрифт",
 type: "boolean",
 component: "switch",

 options: [{
	 value: true,
	 label: "On"
 }, {
	 value: false,
	 label: "OFF"
 }],
 defaultValue: false
 };


 var barsValues = {
	 ref: "props.barsValues",
	 label: "Значения",
	 type: "boolean",
	 component: "switch",

	 options: [{
		 value: true,
		 label: "On"
	 }, {
		 value: false,
		 label: "OFF"
	 }],
	 defaultValue: false
 };

 var lineValAngle =  {
		 type: "integer",
		 component: "slider",
		 label: "Угол наклона значений",
		 ref: "props.lineValAngle",
		 min: -90,
		 max: 90,
		 step: 10
}

var barValAngle =  {
		type: "integer",
		component: "slider",
		label: "Угол наклона значений",
		ref: "props.barValAngle",
		min: -90,
		max: 90,
		step: 10
}

var barValVerticalAlign = {
	ref: "props.barValVerticalAlign",
	label: "Вертикальное выравнивание",
	type: "string",
	component: "dropdown",

	options: [{
		value: "top",
		label: "Top"
	}, {
		value: "middle",
		label: "Middle"
	}, {
		value: "bottom",
		label: "Bottom"
	}
],
	defaultValue: "middle"
};

var barValHorizontalAlign = {
	ref: "props.barValHorizontalAlign",
	label: "Горизонтальное выравнивание",
	type: "string",
	component: "dropdown",

	options: [{
		value: "left",
		label: "Left"
	}, {
		value: "center",
		label: "Center"
	}, {
		value: "right",
		label: "Right"
	}
],
	defaultValue: "center"
};

var lineTextAlign = {
	ref: "props.lineTextAlign",
	label: "Выравнование по горизонтали",
	type: "string",
	component: "dropdown",

	options: [{
		value: "end",
		label: "Left"
	}, {
		value: "middle",
		label: "Center"
	}, {
		value: "start",
		label: "Right"
	}
],
	defaultValue: "middle"
};

var fillPoints = {
	ref: "props.fillPoints",
	label: "Закрасить",
	type: "boolean",
	component: "switch",

	options: [{
		value: true,
		label: "On"
	}, {
		value: false,
		label: "Off"
	}],
	defaultValue: false
};

 // var lineValAngle =  {
 //  ref: "props.lineValAngle",
 //  label: "Угол наклона значений",
 //  type: "integer",
 //  defaultValue: 0
 // }
 var lineTextOffset =  {
		 type: "integer",
		 component: "slider",
		 label: "Отступ",
		 ref: "props.lineTextOffset",
		 min: 0,
		 max: 20,
		 step: 1,
		 defaultValue: 0
}


 var radius =  {
		 type: "integer",
		 component: "slider",
		 label: "Радиус",
		 ref: "props.radius",
		 min: 1,
		 max: 15,
		 step: 1
}

	// var radius = {
	// 	ref: "props.radius",
	// 	label: "Радиус",
	// 	type: "integer",
	// 	defaultValue: 5
	// }

	var dashed =  {
			type: "integer",
			component: "slider",
			label: "Длина пунктира",
			ref: "props.dashed",
			min: 0,
			max: 10,
			step: 1,
			defaultValue: 0
}

	// var dashed = {
	// 	ref: "props.dashed",
	// 	label: "Длина пунктира",
	// 	type: "integer",
	// 	defaultValue: 2
	// };

	var shape = {
		ref: "qDef.lineShape",
		label: "Тип линии",
		type: "string",
		component: "dropdown",

		options: [{
			value: "cardinal",
			label: "Cardinal"
		}, {
			value: "linear",
			label: "Linear"
		}],
		defaultValue: "linear"
	};

	// var lineWidth = {
	// 	ref: "props.lineWidth",
	// 	label: "Толщина линии",
	// 	type: "integer",
	// 	defaultValue: 2
	// };

	var lgOffset = {
		type: "integer",
		component: "slider",
		label: "Ширина метки",
		ref: "props.lgOffset",
		min: 5,
		max: 30,
		step: 5,
		defaultValue: 10
	};


	var lgFontSize =  {
			type: "integer",
			component: "slider",
			label: "Размер шрифта",
			ref: "props.lgFontSize",
			min: 9,
			max: 20,
			step: 1,
			defaultValue: 9
}

	var lineFontSize =  {
			type: "integer",
			component: "slider",
			label: "Размер шрифта",
			ref: "props.lineFontSize",
			min: 9,
			max: 20,
			step: 1,
			defaultValue: 9
}

var barFontSize =  {
		type: "integer",
		component: "slider",
		label: "Размер шрифта",
		ref: "props.barFontSize",
		min: 9,
		max: 20,
		step: 1,
		defaultValue: 9
}

	var lineWidth =  {
			type: "integer",
			component: "slider",
			label: "Толщина линии",
			ref: "props.lineWidth",
			min: 1,
			max: 10,
			step: 1,
			defaultValue: 1
}

	var myTextBox = {
		ref: "props.axisX",
		label: "ОсьX",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: true
	};

	var myTextBox2 = {
		ref: "props.axisY",
		label: "ОсьY",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: true
	};

	var type = {
		ref: "props.typeBar",
		label: "Тип столбцов",
		type: "string",
		component: "switch",

		options: [{
			value: "stacked",
			label: "Стэк"
		}, {
			value: "grouped",
			label: "Группа"
		}],
		defaultValue: "stacked"
	};

	var legend = {
		ref: "props.legend",
		label: "Легенда",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: false
	};

	var titleX = {
		ref: "props.titleX",
		label: "Заголовок X",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: false
	};

	// var titleY = {
	// 	ref: "props.titleY",
	// 	label: "Заголовок Y",
	// 	type: "boolean",
	// 	component: "switch",
	//
	// 	options: [{
	// 		value: true,
	// 		label: "On"
	// 	}, {
	// 		value: false,
	// 		label: "OFF"
	// 	}],
	// 	defaultValue: false
	// };

	var randomColors = {
		ref: "props.ramdomColors",
		label: "Случайные цвета",
		type: "boolean",
		component: "switch",

		options: [{
			value: true,
			label: "On"
		}, {
			value: false,
			label: "OFF"
		}],
		defaultValue: true
	};


var color = {
	label: "Цвет",
	ref: "qDef.color",
	type: "string",
	defaultValue: '#f4f4f4',
	expression: "always"
}


var colorPicker = {
		label:"Градиент От",
		component: "color-picker",
		ref: "props.myColor",
		type: "integer",
		defaultValue: 0
};


var colorPicker2 = {
		label:"Градиент До",
		component: "color-picker",
		ref: "props.myColor2",
		type: "integer",
		defaultValue: 0
};



var textColor = {
		label:"Цвет текста",
		ref: "qDef.textColor",
		type: "string",
		defaultValue: 'black',
		expression: "always"
};


	var appearanceSection = {
	    uses: "settings",
	    items: {
	        // Definition of the custom section header
					legend: {
						type: "items",
						label: "Легенда",
						items: {
							legend: legend,
							lgFontSize: lgFontSize,
							lgOffset: lgOffset
						}
					},
					bars: {
						type: "items",
						label: "Столбцы",
						items: {
							barsType: type,
							barsValues: barsValues,
							barValHorizontalAlign: barValHorizontalAlign,
							barValVerticalAlign: barValVerticalAlign,
							angle: barValAngle,
							barFontSize: barFontSize,
							fontWeight: barFontWeight
						}
					},
					lines: {
						type: "items",
						label: "Линии",
						items: {
							width: lineWidth,
							dashed: dashed,
							circles: circles,
							fillPoints: fillPoints,
							radius: radius,
							values: values,
							lineTextAlign: lineTextAlign,
							lineTextOffset: lineTextOffset,
							angle: lineValAngle,
							lineFontSize: lineFontSize,
							fontWeight: lineFontWeight
						}
					},
	        myNewHeader: {
	            type: "items",
	            label: "Оси",
	            items: {
	                myTextBox: myTextBox,
									myTextBox2: myTextBox2,
									titleX: titleX
									// titleY: titleY

	            }
	        }
					// ,
					// myNewHeader2: {
					// 		type: "items",
					// 		label: "Цвет",
					// 		items: {
					// 					randomColors: randomColors,
					// 					color1: colorPicker,
					// 					color2: colorPicker2,
					// 					textColor: textColor
					//
					// 		}
					// },

	    }
	}


	return 	{
			type: "items",
			component: "accordion",
			items: {
			  dimensions: {
				uses: "dimensions"
			  },
			  measures: {
				uses: "measures",
				min: 2,
				max: 10,
				items: {
					// colorLabelProp: {
					// 	type: "string",
					// 	label: "Цвет по выражению",
					// 	ref: "qAttributeExpressions.0.qExpression",
					// 	expression: 'always',
					// 	defaultValue: ''
					// },
					color: color,
					textColor: textColor,
					line: {
						type: "boolean",
						component: "switch",
						label: "Преобразовать в линию",
						ref: "qDef.line",
						options: [
							{
								label: "On",
								value: true
							},
							{
								label: 'Off',
								value: false
							}

						],
						defaultValue: false
					},
					shape: shape
				}
			  },
			  sorting: {
				uses: "sorting"
			  },
			  appearance: appearanceSection
			}
		 };


 });