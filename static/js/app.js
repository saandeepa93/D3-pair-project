const svg_dom_progress = '#vis_progress'
const svg_dom_train_acc = '#vis_1'
const svg_dom_val_acc = '#vis_2'
const svg_dom_train_loss = '#vis_3'
const svg_dom_val_loss = '#vis_4'
const svg_dom_avg_grad = '#vis_5'
const svg_dom_gpu_usage = '#vis_summ'

func1 = () => {
  
  data = d3.csv("/static/data/metrics.csv", row => {
    return {
      epoch: +row.epoch + 1,
      train_acc: +row.train_acc,
      val_acc: +row.val_acc,
      train_loss: +row.train_loss,
      val_loss: +row.val_loss,
      avg_grad: +row.avg_grad,
      GPU1_tot: +row.GPU1_tot,
      GPU1_occ: +row.GPU1_occ
    }
  })
  .then(data => {
    update_progress(data, svg_dom_progress)
    update_train_acc(data, svg_dom_train_acc)
    update_val_acc(data, svg_dom_val_acc)
    update_train_loss(data, svg_dom_train_loss)
    update_val_loss(data, svg_dom_val_loss)
    update_avg_grad(data, svg_dom_avg_grad)
    update_gpu_usage(data, svg_dom_gpu_usage)
    
  })
}


update_progress = (data, svg_dom) => {
  data_progress = data.map(d => {
    return {
      epoch: d.epoch
    }
  });
  current_epoch = d3.max(data_progress, d => d.epoch)

  // $('#prog_label').html('Starting Training...')
  const max_epoch = +100

  const svg_el_progress = d3.select(svg_dom)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  

  // Create margins
  margin = {top: 0, left: 150, bottom: 0, right: 150}

  const innerHeight = svg_height - margin.top - margin.bottom
  const innerWidth = svg_width - margin.left - margin.right

  const group_el = svg_el_progress.append('g')
                        .attr('transform', `translate(${margin.left}, 0)`)
  
  const xScale = d3.scaleLinear()
                    .domain([0, max_epoch])
                    .range([0, innerWidth])
                    .nice()
    
  group_el.append('rect')
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('fill', 'gray')
          .attr('height', 15)
          .attr('width', xScale(max_epoch))
          .attr('x', 0)

  colors = ['yellow', 'orange', 'green']
  var progress = group_el.append('rect')
					.attr('height', 15)
					.attr('width', xScale(current_epoch))
					.attr('rx', 10)
					.attr('ry', 10)
					.attr('x', 0)
          .style('fill', () => {
            if(current_epoch <= 33)
              return 'yellow'
            else if(current_epoch > 33 && current_epoch <=66)
              return 'orange'
            else  
              return 'green'
          })
}

update_train_acc = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)

  data_train_acc = data.map(d => {
    return {
      epoch: +d.epoch,
      train_acc: +d.train_acc * 100
    }
  })

  console.log("train", data_train_acc)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 20, left: 40, bottom: 40, right: 30}

  //circle radius
  const orig_rad = 2
  var circle_rad = orig_rad

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("class", "main_g")

  const xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, innerWidth])
                    .nice()

  const yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([innerHeight, 0])
                    .nice()

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight)
  const xAxisG = group_el.append('g')
                          .call(xAxis)
                          .attr('transform', `translate(0, ${innerHeight})`)
                          // .style('font', '15px times')
                          .style('stroke', 'rgb(142, 136, 131)')

  xAxisG.selectAll('.tick line')  
                          .style('stroke', 'rgb(192, 197, 187)')
  
  xAxisG.append('text')
      .text('Epochs')
      .attr('x', innerWidth/2)
      .attr('y', 30)
      .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  // xAxisG.select('.tick line').remove()

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth)
  const yAxisG = group_el.append('g').call(yAxis)
            .classed('axisFont', true)
  yAxisG.selectAll('.tick line')
          .style('stroke', 'rgb(192, 197, 187)')
  yAxisG.append('text')
        .text('Accuracy')
        .attr('x', -innerHeight/3.5)
        .attr('y', -20)
        .attr('transform', 'rotate(-90)')
        .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  /*
  BEGIN: TOOLTIP
  */
  const tooltip = svg_el
        .append('text')
        .style('opacity', 0)
        .style('stroke', 'rgb(99, 95, 93)')

  var onMouseOver = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 1)

    tooltip
      .text("Accuracy: " + d.train_acc.toFixed(2))
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.mouse(this)[1]+15)

    d3.select(this)
      .transition()
      .duration(10)
      .attr('r', 10)
  }

  var onMouseOut = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 0)
    
    
    d3.select(this)
      .transition()
      .duration(100)
      .attr('r', circle_rad)
  }
  /*
  END: TOOLTIP 
  */
  /*
  BEGIN: Brush 
  */
  var brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", updateChart) 
  var path = d3.select('.main_g').append('g').attr('class', 'brush').call(brush)
  /*
  END: Brush 
  */

  const lineGenerator = d3.line()
                          .x(d => xScale(d.epoch))
                          .y(d => yScale(d.train_acc * 100))
  group_el.append('path')
          .attr('class', 'myLine')
          .attr('d', lineGenerator(data))
          .attr('stroke', 'maroon')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke-linejoin', 'round')

  group_el.selectAll('circle')
          .data(data_train_acc)
          .enter()
          .append('circle')
          .on("mouseover.tooltip", onMouseOver)
          .on("mouseout.tooltip", onMouseOut)
          .attr('cx', d => xScale(d.epoch))
          .attr('cy', d => yScale(d.train_acc))
          .attr('r', circle_rad)
          .attr('cursor', 'pointer')
          // .style('opacity', '0.2')
          .style('fill', 'steelblue')

  /*
  BEGIN: Brush 
  */
  var idleTimeout
  function idled() { idleTimeout = null; }
  function updateChart() {
    circle_rad = orig_rad * 3

    console.log(xScale.domain())
    extent = d3.event.selection
    
    if (!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain([0, 100])
    }
    else{
      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
      group_el.select(".brush").call(brush.move, null)
    }
    console.log(xScale.domain())
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.train_acc)).attr('r', circle_rad)
    group_el.select('.myLine').transition().duration(1000).attr('d', lineGenerator(data))
    console.log("here")

  }

  group_el.on('dblclick', function(){
    circle_rad = orig_rad
    xScale.domain([0, 100])
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.train_acc)).attr('r', circle_rad)
    group_el.select('.myLine').transition().duration(1000).attr('d', lineGenerator(data))
  })

  /*
  END: Brush 
  */
}


update_val_acc = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)

  data_val_acc = data.map(d => {
    return {
      epoch: +d.epoch,
      val_acc: +d.val_acc * 100
    }
  })

  console.log("val", data_val_acc)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 20, left: 40, bottom: 40, right: 30}

  //circle radius
  const orig_rad = 2
  var circle_rad = orig_rad

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("class", "va_main_g")

  const xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, innerWidth])
                    .nice()

  const yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([innerHeight, 0])
                    .nice()

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight)
  
  const xAxisG = group_el.append('g')
                          .call(xAxis)
                          .attr('transform', `translate(0, ${innerHeight})`)
                          // .style('font', '15px times')
                          .style('stroke', 'rgb(142, 136, 131)')
  xAxisG.selectAll('.tick line')
                          .style('stroke', 'rgb(192, 197, 187)')
  xAxisG.append('text')
      .text('Epochs')
      .attr('x', innerWidth/2)
      .attr('y', 30)
      .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')
  // xAxisG.select('.tick line').remove()

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth)
  const yAxisG = group_el.append('g').call(yAxis)
                        .classed('axisFont', true)
  yAxisG.selectAll('.tick line')
          .style('stroke', 'rgb(192, 197, 187)')

  yAxisG.append('text')
        .text('Accuracy')
        .attr('x', -innerHeight/3.5)
        .attr('y', -20)
        .attr('transform', 'rotate(-90)')
        .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  /*
  BEGIN: TOOLTIP
  */
  const tooltip = svg_el
        .append('text')
        .style('opacity', 0)
        .style('stroke', 'rgb(99, 95, 93)')

  var onMouseOver = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 1)

    tooltip
      .text("Accuracy: " + d.val_acc.toFixed(2))
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.mouse(this)[1]+15)

    d3.select(this)
      .transition()
      .duration(10)
      .attr('r', 10)
  }

  var onMouseOut = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 0)
    
    
    d3.select(this)
      .transition()
      .duration(100)
      .attr('r', circle_rad)
  }
  /*
  END: TOOLTIP 
  */
  /*
  BEGIN: Brush 
  */
  var brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", updateChart) 
  var path = d3.select('.va_main_g').append('g').attr('class', 'va_brush').call(brush)
  /*
  END: Brush 
  */

  const lineGenerator = d3.line()
                          .x(d => xScale(d.epoch))
                          .y(d => yScale(d.val_acc * 100))
  group_el.append('path')
          .attr('class', 'va_myLine')
          .attr('d', lineGenerator(data))
          .attr('stroke', 'maroon')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke-linejoin', 'round')

  group_el.selectAll('circle')
          .data(data_val_acc)
          .enter()
          .append('circle')
          .on("mouseover.tooltip", onMouseOver)
          .on("mouseout.tooltip", onMouseOut)
          .attr('cx', d => xScale(d.epoch))
          .attr('cy', d => yScale(d.val_acc))
          .attr('r', circle_rad)
          .attr('cursor', 'pointer')
          // .style('opacity', '0.2')
          .style('fill', 'steelblue')

  /*
  BEGIN: Brush 
  */
  var idleTimeout
  function idled() { idleTimeout = null; }
  function updateChart() {
    circle_rad = orig_rad * 3

    console.log(xScale.domain())
    extent = d3.event.selection
    
    if (!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain([0, 100])
    }
    else{
      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
      group_el.select(".va_brush").call(brush.move, null)
    }
    console.log(xScale.domain())
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.val_acc)).attr('r', circle_rad)
    group_el.select('.va_myLine').transition().duration(1000).attr('d', lineGenerator(data))
    console.log("here")

  }

  group_el.on('dblclick', function(){
    circle_rad = orig_rad
    xScale.domain([0, 100])
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.val_acc)).attr('r', circle_rad)
    group_el.select('.myLine').transition().duration(1000).attr('d', lineGenerator(data))
  })

  /*
  END: Brush 
  */
}




update_train_loss = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)

  data_train_loss= data.map(d => {
    return {
      epoch: +d.epoch,
      train_loss: +d.train_loss
    }
  })

  console.log("val", data_val_acc)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 20, left: 40, bottom: 40, right: 30}

  //circle radius
  const orig_rad = 2
  var circle_rad = orig_rad

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("class", "tl_main_g")

  const xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, innerWidth])
                    .nice()

  const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, d=> d.train_loss) + 1])
                    .range([innerHeight, 0])
                    .nice()

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight)
  
  const xAxisG = group_el.append('g')
                          .call(xAxis)
                          .attr('transform', `translate(0, ${innerHeight})`)
                          // .style('font', '15px times')
                          .style('stroke', 'rgb(142, 136, 131)')
  xAxisG.selectAll('.tick line')
                          .style('stroke', 'rgb(192, 197, 187)')
  xAxisG.append('text')
      .text('Epochs')
      .attr('x', innerWidth/2)
      .attr('y', 30)
      .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')
  // xAxisG.select('.tick line').remove()

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth)
  const yAxisG = group_el.append('g').call(yAxis)
                        .classed('axisFont', true)
  yAxisG.selectAll('.tick line')
          .style('stroke', 'rgb(192, 197, 187)')

  yAxisG.append('text')
        .text('Loss')
        .attr('x', -innerHeight/3.5)
        .attr('y', -20)
        .attr('transform', 'rotate(-90)')
        .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  /*
  BEGIN: TOOLTIP
  */
  const tooltip = svg_el
        .append('text')
        .style('opacity', 0)
        .style('stroke', 'rgb(99, 95, 93)')

  var onMouseOver = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 1)

    tooltip
      .text("Loss: " + d.train_loss.toFixed(2))
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.mouse(this)[1]+15)

    d3.select(this)
      .transition()
      .duration(10)
      .attr('r', 10)
  }

  var onMouseOut = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 0)
    
    
    d3.select(this)
      .transition()
      .duration(100)
      .attr('r', circle_rad)
  }
  /*
  END: TOOLTIP 
  */
  /*
  BEGIN: Brush 
  */
  var brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", updateChart) 
  var path = d3.select('.tl_main_g').append('g').attr('class', 'tl_brush').call(brush)
  /*
  END: Brush 
  */

  const lineGenerator = d3.line()
                          .x(d => xScale(d.epoch))
                          .y(d => yScale(d.train_loss))
  group_el.append('path')
          .attr('class', 'tl_myLine')
          .attr('d', lineGenerator(data))
          .attr('stroke', 'maroon')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke-linejoin', 'round')

  group_el.selectAll('circle')
          .data(data_train_loss)
          .enter()
          .append('circle')
          .on("mouseover.tooltip", onMouseOver)
          .on("mouseout.tooltip", onMouseOut)
          .attr('cx', d => xScale(d.epoch))
          .attr('cy', d => yScale(d.train_loss))
          .attr('r', circle_rad)
          .attr('cursor', 'pointer')
          // .style('opacity', '0.2')
          .style('fill', 'steelblue')

  /*
  BEGIN: Brush 
  */
  var idleTimeout
  function idled() { idleTimeout = null; }
  function updateChart() {
    circle_rad = orig_rad * 3

    console.log(xScale.domain())
    extent = d3.event.selection
    
    if (!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain([0, 100])
    }
    else{
      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
      group_el.select(".tl_brush").call(brush.move, null)
    }
    console.log(xScale.domain())
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.train_loss)).attr('r', circle_rad)
    group_el.select('.tl_myLine').transition().duration(1000).attr('d', lineGenerator(data))
    console.log("here")

  }

  group_el.on('dblclick', function(){
    circle_rad = orig_rad
    xScale.domain([0, 100])
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.train_loss)).attr('r', circle_rad)
    group_el.select('.myLine').transition().duration(1000).attr('d', lineGenerator(data))
  })

  /*
  END: Brush 
  */
}



update_val_loss = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)

  data_val_loss= data.map(d => {
    return {
      epoch: +d.epoch,
      val_loss: +d.val_loss
    }
  })

  console.log("val", data_val_loss)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 20, left: 40, bottom: 40, right: 30}

  //circle radius
  const orig_rad = 2
  var circle_rad = orig_rad

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("class", "vl_main_g")

  const xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, innerWidth])
                    .nice()

  const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, d=> d.val_loss) + 1])
                    .range([innerHeight, 0])
                    .nice()

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight)
  
  const xAxisG = group_el.append('g')
                          .call(xAxis)
                          .attr('transform', `translate(0, ${innerHeight})`)
                          // .style('font', '15px times')
                          .style('stroke', 'rgb(142, 136, 131)')
  xAxisG.selectAll('.tick line')
                          .style('stroke', 'rgb(192, 197, 187)')
  xAxisG.append('text')
      .text('Epochs')
      .attr('x', innerWidth/2)
      .attr('y', 30)
      .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')
  // xAxisG.select('.tick line').remove()

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth)
  const yAxisG = group_el.append('g').call(yAxis)
                        .classed('axisFont', true)
  yAxisG.selectAll('.tick line')
          .style('stroke', 'rgb(192, 197, 187)')

  yAxisG.append('text')
        .text('Loss')
        .attr('x', -innerHeight/3.5)
        .attr('y', -20)
        .attr('transform', 'rotate(-90)')
        .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  /*
  BEGIN: TOOLTIP
  */
  const tooltip = svg_el
        .append('text')
        .style('opacity', 0)
        .style('stroke', 'rgb(99, 95, 93)')

  var onMouseOver = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 1)

    tooltip
      .text("Loss: " + d.val_loss.toFixed(2))
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.mouse(this)[1]+15)

    d3.select(this)
      .transition()
      .duration(10)
      .attr('r', 10)
  }

  var onMouseOut = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 0)
    
    
    d3.select(this)
      .transition()
      .duration(100)
      .attr('r', circle_rad)
  }
  /*
  END: TOOLTIP 
  */
  /*
  BEGIN: Brush 
  */
  var brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", updateChart) 
  var path = d3.select('.vl_main_g').append('g').attr('class', 'vl_brush').call(brush)
  /*
  END: Brush 
  */

  const lineGenerator = d3.line()
                          .x(d => xScale(d.epoch))
                          .y(d => yScale(d.val_loss))
  group_el.append('path')
          .attr('class', 'tl_myLine')
          .attr('d', lineGenerator(data))
          .attr('stroke', 'maroon')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke-linejoin', 'round')

  group_el.selectAll('circle')
          .data(data_val_loss)
          .enter()
          .append('circle')
          .on("mouseover.tooltip", onMouseOver)
          .on("mouseout.tooltip", onMouseOut)
          .attr('cx', d => xScale(d.epoch))
          .attr('cy', d => yScale(d.val_loss))
          .attr('r', circle_rad)
          .attr('cursor', 'pointer')
          // .style('opacity', '0.2')
          .style('fill', 'steelblue')

  /*
  BEGIN: Brush 
  */
  var idleTimeout
  function idled() { idleTimeout = null; }
  function updateChart() {
    circle_rad = orig_rad * 3

    console.log(xScale.domain())
    extent = d3.event.selection
    
    if (!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain([0, 100])
    }
    else{
      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
      group_el.select(".vl_brush").call(brush.move, null)
    }
    console.log(xScale.domain())
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.val_loss)).attr('r', circle_rad)
    group_el.select('.vl_myLine').transition().duration(1000).attr('d', lineGenerator(data))
    console.log("here")

  }

  group_el.on('dblclick', function(){
    circle_rad = orig_rad
    xScale.domain([0, 100])
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.val_loss)).attr('r', circle_rad)
    group_el.select('.vl_myLine').transition().duration(1000).attr('d', lineGenerator(data))
  })

  /*
  END: Brush 
  */
}


update_avg_grad = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)

  data_avg_grad= data.map(d => {
    return {
      epoch: +d.epoch,
      avg_grad: +d.avg_grad
    }
  })

  console.log("val", data_val_loss)

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 20, left: 50, bottom: 40, right: 30}

  //circle radius
  const orig_rad = 2
  var circle_rad = orig_rad

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr("class", "g_main_g")

  const xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, innerWidth])
                    .nice()

  const yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.avg_grad), d3.max(data, d=> d.avg_grad)])
                    .range([innerHeight, 0])
                    .nice()

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight)
  
  const xAxisG = group_el.append('g')
                          .call(xAxis)
                          .attr('transform', `translate(0, ${innerHeight})`)
                          // .style('font', '15px times')
                          .style('stroke', 'rgb(142, 136, 131)')
  xAxisG.selectAll('.tick line')
                          .style('stroke', 'rgb(192, 197, 187)')
  xAxisG.append('text')
      .text('Epochs')
      .attr('x', innerWidth/2)
      .attr('y', 30)
      .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')
  // xAxisG.select('.tick line').remove()

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth)
  const yAxisG = group_el.append('g').call(yAxis)
                        .classed('axisFont', true)
  yAxisG.selectAll('.tick line')
          .style('stroke', 'rgb(192, 197, 187)')

  yAxisG.append('text')
        .text('Grad')
        .attr('x', -innerHeight/3.5)
        .attr('y', -30)
        .attr('transform', 'rotate(-90)')
        .style('fill', 'black')
        .style('font', '12px sans-serif')
        .style('stroke', 'rgb(99, 95, 93)')

  /*
  BEGIN: TOOLTIP
  */
  const tooltip = svg_el
        .append('text')
        .style('opacity', 0)
        .style('stroke', 'rgb(99, 95, 93)')

  var onMouseOver = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 1)

    tooltip
      .text("Grad: " + d.avg_grad.toFixed(3))
      .attr('x', d3.mouse(this)[0])
      .attr('y', d3.mouse(this)[1]+15)

    d3.select(this)
      .transition()
      .duration(10)
      .attr('r', 10)
  }

  var onMouseOut = function(d) {
    tooltip 
    .transition()
    .duration(50)
    .style('opacity', 0)
    
    
    d3.select(this)
      .transition()
      .duration(100)
      .attr('r', circle_rad)
  }
  /*
  END: TOOLTIP 
  */
  /*
  BEGIN: Brush 
  */
  var brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", updateChart) 
  var path = d3.select('.g_main_g').append('g').attr('class', 'g_brush').call(brush)
  /*
  END: Brush 
  */

  const lineGenerator = d3.line()
                          .x(d => xScale(d.epoch))
                          .y(d => yScale(d.avg_grad))
  group_el.append('path')
          .attr('class', 'g_myLine')
          .attr('d', lineGenerator(data))
          .attr('stroke', 'maroon')
          .attr('fill', 'none')
          .attr('stroke-width', 2)
          .attr('stroke-linejoin', 'round')

  group_el.selectAll('circle')
          .data(data_avg_grad)
          .enter()
          .append('circle')
          .on("mouseover.tooltip", onMouseOver)
          .on("mouseout.tooltip", onMouseOut)
          .attr('cx', d => xScale(d.epoch))
          .attr('cy', d => yScale(d.avg_grad))
          .attr('r', circle_rad)
          .attr('cursor', 'pointer')
          // .style('opacity', '0.2')
          .style('fill', 'steelblue')

  /*
  BEGIN: Brush 
  */
  var idleTimeout
  function idled() { idleTimeout = null; }
  function updateChart() {
    circle_rad = orig_rad * 3

    console.log(xScale.domain())
    extent = d3.event.selection
    
    if (!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
      xScale.domain([0, 100])
    }
    else{
      xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
      group_el.select(".g_brush").call(brush.move, null)
    }
    console.log(xScale.domain())
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.avg_grad)).attr('r', circle_rad)
    group_el.select('.g_myLine').transition().duration(1000).attr('d', lineGenerator(data))
    console.log("here")

  }

  group_el.on('dblclick', function(){
    circle_rad = orig_rad
    xScale.domain([0, 100])
    newxAxis = d3.axisBottom(xScale)
    xAxisG.transition().duration(1000).call(newxAxis)
    group_el.selectAll('circle').transition().duration(1000) .attr('cx', d => xScale(d.epoch)).attr('cy', d => yScale(d.avg_grad)).attr('r', circle_rad)
    group_el.select('.g_myLine').transition().duration(1000).attr('d', lineGenerator(data))
  })

  /*
  END: Brush 
  */
}

update_gpu_usage = (data, svg_dom) => {
  var svg_el = d3.select(svg_dom)
  
  current_epoch = d3.max(data_progress, d => d.epoch)
  last_data = data[current_epoch]
  pie_data = {"Free": last_data['GPU1_tot'] - last_data['GPU1_occ'], "Used": last_data['GPU1_occ']}

  perc = [last_data['GPU1_occ']/last_data['GPU1_tot'], 1 - (last_data['GPU1_occ']/last_data['GPU1_tot'])]

  // Retreive SVG element dimensions
  const svg_width  = $(svg_dom).width();
  const svg_height  = $(svg_dom).height();

  // Create margins
  margin = {top: 5, left: 5, bottom: 5, right: 5}

  // Set inner width and Height based on margins
  innerHeight = svg_height - margin.top - margin.bottom
  innerWidth = svg_width - margin.left - margin.right
  
  var radius = Math.min(innerWidth, innerHeight) / 2

  // Create a group element inside margin where charts will be plotted
  const group_el = svg_el.append('g')
                    .attr('transform', `translate(${svg_width/2}, ${svg_height/2})`)
                    .attr("class", "g_main_g")

  var color = d3.scaleOrdinal()
    .domain(pie_data)
    .range(d3.schemeSet2)

  var pie = d3.pie()
              .value(d => d.value)
  var data_ready = pie(d3.entries(pie_data))

  var arcGenerator = d3.arc()
                        .innerRadius(0)
                        .outerRadius(radius)

  group_el.selectAll('myArcs')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arcGenerator)
          .attr('fill', d => color(d.data.key))
          .attr('stroke', 'black')
          .style('opacity', 0.7)
      
  group_el.selectAll('myArcs')
          .data(data_ready)
          .enter()
          .append('text')
          .text((d, i) => (perc[i] * 100).toFixed(2) + "%")
          .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
          .style('text-anchor', 'middle')
          .style('font-size', '12px')

  svg_el.selectAll('mySquares')
          .data(data_ready)
          .enter()
          .append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('x', innerWidth - 50)
          .attr('y', (d, i) => (margin.top) + (i * 25))
          .style('fill', (d, i) => color(d.data.key))
    
  svg_el.selectAll('myLabels')
          .data(data_ready)
          .enter()
          .append('text')
          .text((d, i) => d.data.key)
          .attr('x', innerWidth - 35)
          .attr('y', (d, i) => (margin.top+10) + (i * 25))
          .style('font-size', '12px')
}


