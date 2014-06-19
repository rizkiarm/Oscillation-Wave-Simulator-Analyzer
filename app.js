(function() {
  var page, paused;
  var wave, wavesum, oceanwave, bg = [], waveinfo = [], oceanwaveinfo = [], waveformula = [];
  var wavelengthRange, amplitudeRange, phaseRange, speedRange;
  var WAVELENGTH_MAGNIFY = 5;
  var GRAVITATION = 9.8;
  var time, timer;
  
  init();
  function init(){
    page = 'single_page';

    paused = [];
    paused['single_page'] = false;
    paused['inter_page'] = false;
    paused['ocean_page'] = false;

    wavelengthRange = new range(1,100);
    amplitudeRange = new range(0,100);
    phaseRange = new range(0,360);
    speedRange = new range(-50,50);
    windSpeedRange = new range(-45,45);
    time = [];
    time['single_page'] = 0;
    time['inter_page'] = 0;
    time['ocean_page'] = 0;

    wave['single_page'] = [];
    wave['single_page'][0] = new wave(1, 60, 50, 4, 0, 3, '#ecf0f1', 1024, 400);
    bg[0] = new background(1,'#2980b9','#3498db',.3,12,1024,600);
    waveControls(wave['single_page'][0]);
    waveinfo['single_page'] = [];
    waveinfo['single_page'][0] = wave['single_page'][0];
    waveformula['single_page'] = [];
    waveformula['single_page'][0] = wave['single_page'][0];

    wave['inter_page'] = [];
    wave['inter_page'][0] = new wave(2, 30, 90, 4, 10, 3, '#ecf0f1', 300, 100);
    wave['inter_page'][1] = new wave(3, 40, 50, -10, 40, 3, '#ecf0f1', 300, 100);
    wavesum['inter_page'] = [];
    wavesum['inter_page'][0] = new wavesum('2_3', wave['inter_page'][0], wave['inter_page'][1], 3, '#ecf0f1', 1024, 400);
    bg[1] = new background(2,'#2980b9','#3498db',.3,12,1024,600);
    waveControls(wave['inter_page'][0]);
    waveControls(wave['inter_page'][1]);
    waveinfo['inter_page'] = [];
    waveinfo['inter_page'][1] = wavesum['inter_page'][0];
    waveinfo['inter_page'][2] = wave['inter_page'][0];
    waveinfo['inter_page'][3] = wave['inter_page'][1];

    oceanwave['ocean_page'] = [];
    oceanwave['ocean_page'][0] = new oceanwave(4, 120, 30, 5, 0, 0, new ball(1,'#C19264','#f9ba3e',100,15), 3, '#fff', '#00b2ff', 1024, 600);
    waveControls(oceanwave['ocean_page'][0]);
    oceanwaveinfo['ocean_page'] = [];
    oceanwaveinfo['ocean_page'][0] = oceanwave['ocean_page'][0];

    for(i in bg) drawBackground(bg[i]);

    initAll(['single_page','inter_page','ocean_page']);
    animateStart();
  }
  
  function range(min,max){
   	var r = new Object();
    r.min = min;
    r.max = max;
    return r;
  }

  function waveFormula(wave){
    var idx = wave.idx;
    if(typeof wave.wave_a === "undefined"){
      var k = Math.round((2 * Math.PI / wave.wavelength) * 100) / 100;
      var wavelength = wave.wavelength;
      var speed = wave.speed;
      var amplitude = wave.amplitude;
      var phase = wave.phase;
    } else {
      var k1 = 2 * Math.PI / wave.wave_a.wavelength;
      var k2 = 2 * Math.PI / wave.wave_b.wavelength;
      var k = Math.round(((1/2 * (k1 + k2)) * 100) / 100);
      var wavelength = Math.round((2 * Math.PI / ((1/2) * (k1 + k2))) * 100) / 100;
      var speed = Math.round((wave.wave_a.speed + wave.wave_b.speed) * 100) / 100;
      var phase = Math.abs(Math.round((wave.wave_a.phase - wave.wave_b.phase) * 100) / 100);
      var amplitude = Math.round(wave.amplitude * 100) / 100;
    }
    var freq = Math.abs(Math.round((speed / wavelength) * 100) / 100);
    var omega = Math.round((2 * Math.PI * freq) * 100) / 100;
    phase = Math.round(phase * Math.PI / 180 * 100) / 100;
    document.getElementById("formula_" + idx).innerHTML = 'y = '+amplitude+' sin ('+k+'x + '+omega+'t + '+phase+')';
  }

  function waveInformation(wave){
    var idx = wave.idx;
    if(typeof wave.wave_a === "undefined"){
      var wavelength = wave.wavelength;
      var speed = wave.speed;
      var amplitude = wave.amplitude;
      var phase = wave.phase;
    } else {
      var k1 = 2 * Math.PI / wave.wave_a.wavelength;
      var k2 = 2 * Math.PI / wave.wave_b.wavelength;
      var wavelength = Math.round((2 * Math.PI / ((1/2) * (k1 + k2))) * 100) / 100;
      var speed = Math.round((wave.wave_a.speed + wave.wave_b.speed) * 100) / 100;
      var phase = Math.abs(Math.round((wave.wave_a.phase - wave.wave_b.phase) * 100) / 100);
      var amplitude = Math.round(wave.amplitude * 100) / 100;
    }
    var freq = Math.abs(Math.round((speed / wavelength) * 100) / 100);
    var T = Math.round((1/freq) * 100) / 100;
    var omega = Math.round((2 * Math.PI * freq) * 100) / 100;

    document.getElementById("value_" + idx + "_1").innerHTML = wavelength;
    document.getElementById("value_" + idx + "_2").innerHTML = amplitude;
    document.getElementById("value_" + idx + "_3").innerHTML = phase;
    document.getElementById("value_" + idx + "_4").innerHTML = speed;
    if(document.getElementById("value_" + idx + "_5") != null){
      document.getElementById("value_" + idx + "_5").innerHTML = freq;
      document.getElementById("value_" + idx + "_6").innerHTML = T;
      document.getElementById("value_" + idx + "_7").innerHTML = omega;
    }
  }

  function oceanWaveInformation(oceanwave){
    function h(xi) {
      if (xi > 500000) xi = 500000;
      
      var x = Math.log(xi)/Math.log(10);
      return  0.0027336911481801 * x * x * x * x * x
          -0.047338700556038 * x * x * x * x
          +0.30136374759533  * x * x * x
          -0.85874717500723  * x * x
          +1.115031374601401 * x
          -0.50304293778164;
    }
    function p(xi) {
      if (xi > 500000) xi = 500000;
      
      var x = Math.log(xi)/Math.log(10);
      return  0.000013082421016367561 * x * x * x * x * x
          -0.000246236315245493   * x * x * x * x
          +0.0016286724530578     * x * x * x
          -0.0045435447286823     * x * x
          +0.0064179166918176     * x
          -0.0025698905219639;
    }
    
    var time_l = time[page];
    var idx = oceanwave.idx;
    var width = oceanwave.width;
    var height = oceanwave.height;

    var ball = oceanwave.ball;
    var windSpeed = -oceanwave.windSpeed / 2;
    var xi = Math.max(10, GRAVITATION * time_l / Math.max(Math.abs(windSpeed / 10000),0.0001));
    var amp = (oceanwave.height * (windSpeed * windSpeed * h(xi) / GRAVITATION)) / (2 * 100) - 2;
    var freq = 2 * Math.PI * windSpeed * p(xi) / (GRAVITATION * WAVELENGTH_MAGNIFY) ;
    var yOrigin = oceanwave.height / 2;
    
    var omega = 2 * Math.PI * freq;
    var lambda = 2 * Math.PI * GRAVITATION / (omega * omega);
    var speed = Math.sqrt((GRAVITATION * lambda) / (2 * Math.PI)) / 20;
    var phase = (oceanwave.phase + time_l*Math.min(speed, 20)) * Math.PI / 180;
    var z = amp * Math.sin(phase + freq * ball.position);
    var v_drift = 4 * Math.PI * Math.PI * amp * amp * Math.exp(4 * Math.PI * z / lambda) * freq / lambda;

    document.getElementById("value_" + idx + "_1").innerHTML = Math.round(Math.abs(lambda));
    document.getElementById("value_" + idx + "_2").innerHTML = Math.abs(Math.round(amp * 200) / 100);
    document.getElementById("value_" + idx + "_4").innerHTML = Math.round(speed * 200) / 100;
    document.getElementById("value_" + idx + "_5").innerHTML = Math.abs(Math.round(freq * 200) / 100);
    document.getElementById("value_" + idx + "_6").innerHTML = Math.abs(Math.round(1 / freq * 200) / 100);
    document.getElementById("value_" + idx + "_7").innerHTML = Math.abs(Math.round(omega * 200) / 100);
    document.getElementById("value_" + idx + "_8").innerHTML = Math.round(oceanwave.windSpeed * 100) / 100;
    document.getElementById("value_" + idx + "_9").innerHTML = - Math.round(v_drift * 200) / 100;
  }

  function waveControls(wave) {
    slider(wave, 1, wavelengthRange, 'horizontal', wave.wavelength);
    slider(wave, 2, amplitudeRange, 'vertical', wave.amplitude);
    slider(wave, 3, phaseRange, 'horizontal', wave.phase);
    slider(wave, 4, speedRange, 'horizontal', wave.speed);
    slider(wave, 8, windSpeedRange, 'horizontal', wave.windSpeed);
  }

  function slider(wave, i, range, orientation, val){
    var idx = "" + wave.idx +"_"+ i;
    $("#slider_" + idx).slider({
      orientation: orientation,
      range : "min",
      min : range.min,
      max : range.max,
      value : val,
      animate : true,
      slide : function(event, ui) {
        adjustWave(wave, i, ui.value);
      }
    });
  }

  function adjustWave(wave, i, val) {
    if (i == 1) wave.wavelength = val;
    else if (i == 2) wave.amplitude = val;
    else if (i == 3) wave.phase = val;
    else if (i == 4) wave.speed = val;
    else if (i == 8) wave.windSpeed = val;
  }

  function initAll(arr){
    for(i in arr){
      var page = arr[i];
      if(typeof wave[page] !== "undefined") for(i in wave[page]) if(typeof wave[page][i] !== "undefined") drawWave(wave[page][i]);
      if(typeof wavesum[page] !== "undefined") for(i in wavesum[page]) if(typeof wavesum[page][i] !== "undefined") drawSum(wavesum[page][i]);
      if(typeof waveinfo[page] !== "undefined") for(i in waveinfo[page]) if(typeof waveinfo[page][i] !== "undefined") waveInformation(waveinfo[page][i]);
      if(typeof waveformula[page] !== "undefined") for(i in waveformula[page]) if(typeof waveformula[page][i] !== "undefined") waveFormula(waveformula[page][i]);
      if(typeof oceanwave[page] !== "undefined") for(i in oceanwave[page]) if(typeof oceanwave[page][i] !== "undefined") drawOceanWave(oceanwave[page][i]);
      if(typeof oceanwaveinfo[page] !== "undefined") for(i in oceanwaveinfo[page]) if(typeof oceanwaveinfo[page][i] !== "undefined") oceanWaveInformation(oceanwaveinfo[page][i]);
    }
  }

  function animateStart() {
    timer = setInterval(function() {
      if(!paused[page]){
        if(typeof wave[page] !== "undefined") for(i in wave[page]) if(typeof wave[page][i] !== "undefined") drawWave(wave[page][i]);
        if(typeof wavesum[page] !== "undefined") for(i in wavesum[page]) if(typeof wavesum[page][i] !== "undefined") drawSum(wavesum[page][i]);
        if(typeof oceanwave[page] !== "undefined") for(i in oceanwave[page]) if(typeof oceanwave[page][i] !== "undefined") drawOceanWave(oceanwave[page][i]);
        if(time[page] & 1){
          if(typeof waveinfo[page] !== "undefined") for(i in waveinfo[page]) if(typeof waveinfo[page][i] !== "undefined") waveInformation(waveinfo[page][i]);
          if(typeof waveformula[page] !== "undefined") for(i in waveformula[page]) if(typeof waveformula[page][i] !== "undefined") waveFormula(waveformula[page][i]);
          if(typeof oceanwaveinfo[page] !== "undefined") for(i in oceanwaveinfo[page]) if(typeof oceanwaveinfo[page][i] !== "undefined") oceanWaveInformation(oceanwaveinfo[page][i]);
        }
        time[page]++;
      }
    }, 1000 / 20);
  }

  function animateStop() {
    clearInterval(timer);
    timer = null;
  }
  
  function wave(idx, wavelength, amplitude, speed, phase, lineWidth, color, width, height){
   	var w = new Object();
    w.idx = idx;
    w.wavelength = wavelength;
    w.amplitude = amplitude;
    w.speed = speed;
    w.phase = phase;
    w.lineWidth = lineWidth;
    w.color = color;
    w.width = width;
    w.height = height;
    
    w.canvas = document.getElementById('canvas-'+idx+'-wave');
    w.buffer = document.createElement('canvas');
    w.buffer.width = w.width;
    w.buffer.height = w.height;
    
    return w;
  }

  function wavesum(idx, wave_a, wave_b, lineWidth, color, width, height){
    var w = new Object();
    w.idx = idx;
    w.lineWidth = lineWidth;
    w.color = color;
    w.width = width;
    w.height = height;

    w.wave_a = wave_a;
    w.wave_b = wave_b;

    w.amplitude = 0;
    
    w.canvas = document.getElementById('canvas-'+idx+'-wavesum');
    w.buffer = document.createElement('canvas');
    w.buffer.width = w.width;
    w.buffer.height = w.height;
    
    return w;
  }

  function oceanwave(idx, wavelength, amplitude, speed, phase, windSpeed, ball, lineWidth, color, bgColor, width, height){
    var w = new Object();
    w.idx = idx;
    w.wavelength = wavelength;
    w.amplitude = amplitude;
    w.speed = speed;
    w.phase = phase;
    w.windSpeed = windSpeed;
    w.ball = ball;
    w.lineWidth = lineWidth;
    w.color = color;
    w.bgColor = bgColor;
    w.width = width;
    w.height = height;
    
    w.canvas = document.getElementById('canvas-'+idx+'-oceanwave');
    w.buffer = document.createElement('canvas');
    w.buffer.width = w.width;
    w.buffer.height = w.height;
    
    return w;
  }

  function ball(idx, color, bgColor, position, radius, fixedPosition) {
    var b = new Object();
    
    b.idx = idx;
    b.color = color;
    b.bgColor = bgColor;
    b.position = position;
    b.radius = radius;
    b.fixedPosition;
    
    return b;
  }
  
  function background(idx, bgColor, lineColor, lineWidth, increment, width, height){
    var b = new Object();
    b.idx = idx;
    b.bgColor = bgColor;
    b.lineColor = lineColor;
    b.lineWidth = lineWidth;
    b.increment = increment;
    b.width = width;
    b.height = height;
    return b;
  }

  function drawWave(wave){
    var time_l = time[page];

    var idx = wave.idx;
    var width = wave.width;
    var height = wave.height;

    var ctx = wave.buffer.getContext('2d');
    ctx.clearRect(0,0,width,height);

    ctx.lineWidth = wave.lineWidth;

    var phase = (wave.phase + time_l*wave.speed) * Math.PI / 180;
    var amp = (wave.height * wave.amplitude) / (2 * 100);
    var freq = 2 * Math.PI * (1 / (wave.wavelength * WAVELENGTH_MAGNIFY));
    var yOrigin = wave.height / 2;

    ctx.beginPath();
    var line_color = 'rgba('+hexToRgb(wave.color).r+','+hexToRgb(wave.color).g+','+hexToRgb(wave.color).b+','+0.2+')';
    ctx.strokeStyle = line_color;
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = wave.color;
    for ( var i = 0; i < wave.width; i++) {
      var y2 = amp * Math.sin(phase + freq * (i + 1)) + yOrigin;
      ctx.lineTo(i + 1, y2);
    }
    ctx.stroke();

    var front_ctx = wave.canvas.getContext("2d");
    front_ctx.clearRect(0, 0, wave.width, wave.height);
    front_ctx.drawImage(wave.buffer, 0, 0);

  }

  function drawSum(wavesum){
    var time_l = time[page];

    var idx = wavesum.idx;
    var width = wavesum.width;
    var height = wavesum.height;

    var ctx = wavesum.buffer.getContext('2d');
    ctx.clearRect(0,0,width,height);

    ctx.lineWidth = wavesum.lineWidth;

    var wave_a = wavesum.wave_a;
    var wave_b = wavesum.wave_b;

    var wave_a_color = 'rgba('+hexToRgb(wave_a.color).r+','+hexToRgb(wave_a.color).g+','+hexToRgb(wave_a.color).b+','+0.3+')';
    var wave_b_color = 'rgba('+hexToRgb(wave_b.color).r+','+hexToRgb(wave_a.color).g+','+hexToRgb(wave_a.color).b+','+0.2+')';

    var phase1 = (wave_a.phase + time_l*wave_a.speed) * Math.PI / 180;
    var phase2 = (wave_b.phase + time_l*wave_b.speed) * Math.PI / 180;
    var amp1 = (wave_a.height * wave_a.amplitude) / (2 * 100);
    var amp2 = (wave_b.height * wave_b.amplitude) / (2 * 100);
    var freq1 = 2 * Math.PI * (1 / (wave_a.wavelength * WAVELENGTH_MAGNIFY));
    var freq2 = 2 * Math.PI * (1 / (wave_b.wavelength * WAVELENGTH_MAGNIFY));
    var yOrigin = height / 2;

    ctx.beginPath();
    var line_color = 'rgba('+hexToRgb(wavesum.color).r+','+hexToRgb(wavesum.color).g+','+hexToRgb(wavesum.color).b+','+0.2+')';
    ctx.strokeStyle = line_color;
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();

    var amplitude_max = 0;

    for ( var i = 0; i < width; i++) {
      var y1_1 = amp1 * Math.sin(phase1 + freq1 * i);
      var y1_2 = amp1 * Math.sin(phase1 + freq1 * (i + 1));

      var y2_1 = amp2 * Math.sin(phase2 + freq2 * i);
      var y2_2 = amp2 * Math.sin(phase2 + freq2 * (i + 1));

      ctx.strokeStyle = wave_a_color;
      ctx.beginPath();
      ctx.moveTo(i, y2_1 + yOrigin);
      ctx.lineTo(i + 1, y2_2 + yOrigin);
      ctx.stroke();

      ctx.strokeStyle = wave_b_color;
      ctx.beginPath();
      ctx.moveTo(i, y1_1 + yOrigin);
      ctx.lineTo(i + 1, y1_2 + yOrigin);
      ctx.stroke();

      ctx.strokeStyle = wavesum.color;
      ctx.beginPath();
      ctx.moveTo(i, y1_1 + y2_1 + yOrigin);
      ctx.lineTo(i + 1, y1_2 + y2_2 + yOrigin);
      ctx.stroke();

      if(wave_a.wavelength == wave_b.wavelength) amplitude_max = 2*(y1_1 + y2_1) > amplitude_max ? 2*(y1_1 + y2_1) : amplitude_max;
    }
    if(wave_a.wavelength != wave_b.wavelength) amplitude_max = wave_a.amplitude + wave_b.amplitude;

    wavesum.amplitude = amplitude_max;

    var front_ctx = wavesum.canvas.getContext("2d");
    front_ctx.clearRect(0, 0, width, height);
    front_ctx.drawImage(wavesum.buffer, 0, 0);
  }

  function drawOceanWave(oceanwave){
    function h(xi) {
      if (xi > 500000) xi = 500000;
      
      var x = Math.log(xi)/Math.log(10);
      return  0.0027336911481801 * x * x * x * x * x
          -0.047338700556038 * x * x * x * x
          +0.30136374759533  * x * x * x
          -0.85874717500723  * x * x
          +1.115031374601401 * x
          -0.50304293778164;
    }
    function p(xi) {
      if (xi > 500000) xi = 500000;
      
      var x = Math.log(xi)/Math.log(10);
      return  0.000013082421016367561 * x * x * x * x * x
          -0.000246236315245493   * x * x * x * x
          +0.0016286724530578     * x * x * x
          -0.0045435447286823     * x * x
          +0.0064179166918176     * x
          -0.0025698905219639;
    }
    
    var time_l = time[page];
    var idx = oceanwave.idx;
    var width = oceanwave.width;
    var height = oceanwave.height;

    var ctx = oceanwave.buffer.getContext('2d');
    ctx.clearRect(0,0,width,height);

    ctx.strokeStyle = oceanwave.color;
    ctx.lineWidth = oceanwave.lineWidth;

    var ball = oceanwave.ball;
    var windSpeed = -oceanwave.windSpeed / 2;
    var xi = Math.max(10, GRAVITATION * time_l / Math.max(Math.abs(windSpeed / 10000),0.0001));
    var amp = (oceanwave.height * (windSpeed * windSpeed * h(xi) / GRAVITATION)) / (2 * 100) - 2;
    var freq = 2 * Math.PI * windSpeed * p(xi) / (GRAVITATION * WAVELENGTH_MAGNIFY) ;
    var yOrigin = oceanwave.height / 2;
    
    var omega = 2 * Math.PI * freq;
    var lambda = 2 * Math.PI * GRAVITATION / (omega * omega);
    var speed = Math.sqrt((GRAVITATION * lambda) / (2 * Math.PI)) / 20;
    var phase = (oceanwave.phase + time_l*Math.min(speed, 20)) * Math.PI / 180;
    var z = amp * Math.sin(phase + freq * ball.position);
    var v_drift = 4 * Math.PI * Math.PI * amp * amp * Math.exp(4 * Math.PI * z / lambda) * freq / lambda;
    ball.position = (ball.position + oceanwave.width - v_drift) % oceanwave.width;    
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba('+hexToRgb(oceanwave.color).r+','+hexToRgb(oceanwave.color).g+','+hexToRgb(oceanwave.color).b+','+0.4+')';
    for ( var i = 0; i < oceanwave.width; i++) {
      var y = amp/4 * Math.sin(phase + (freq*2) * i) + yOrigin;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(oceanwave.width,oceanwave.height);
    ctx.lineTo(0,oceanwave.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba('+hexToRgb(oceanwave.bgColor).r+','+hexToRgb(oceanwave.bgColor).g+','+hexToRgb(oceanwave.bgColor).b+','+0.4+')';
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba('+hexToRgb(oceanwave.color).r+','+hexToRgb(oceanwave.color).g+','+hexToRgb(oceanwave.color).b+','+0.65+')';
    for ( var i = 0; i < oceanwave.width; i++) {
      var y = amp/2 * Math.sin(phase + (freq*1.25) * i) + yOrigin;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(oceanwave.width,oceanwave.height);
    ctx.lineTo(0,oceanwave.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba('+hexToRgb(oceanwave.bgColor).r+','+hexToRgb(oceanwave.bgColor).g+','+hexToRgb(oceanwave.bgColor).b+','+0.65+')';
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.strokeStyle = 'rgba('+hexToRgb(oceanwave.color).r+','+hexToRgb(oceanwave.color).g+','+hexToRgb(oceanwave.color).b+','+0.9+')';
    for ( var i = 0; i < oceanwave.width; i++) {
      var y = amp * Math.sin(phase + freq * i) + yOrigin;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(oceanwave.width,oceanwave.height);
    ctx.lineTo(0,oceanwave.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba('+hexToRgb(oceanwave.bgColor).r+','+hexToRgb(oceanwave.bgColor).g+','+hexToRgb(oceanwave.bgColor).b+','+1+')';
    ctx.fill();
    ctx.stroke();
        
    for ( var i = - ball.radius; i < oceanwave.width + ball.radius; i++) {
      if (Math.abs((i + oceanwave.width) % oceanwave.width - ball.position) < 1) {
        var y1 = amp * Math.sin(phase + freq * (i-ball.radius / 2)) + yOrigin;
        var y2 = amp * Math.sin(phase + freq * (i+ball.radius * 3 / 2)) + yOrigin;
        
        var dist = Math.sqrt((ball.radius*ball.radius) + (y1-y2)*(y1-y2)/4);
        var radius = ball.radius * (ball.radius / dist);
        
        ctx.strokeStyle = ball.color;
        ctx.beginPath();
        ctx.moveTo(i, y1 - radius);
        ctx.lineTo(i + 2 * radius, y2 - radius);
        ctx.lineTo(i + 2 * radius + y1 - y2, y2 + radius);
        ctx.lineTo(i + y1 - y2, y1 + radius);
        ctx.closePath();
        ctx.stroke();
        
        ctx.fillStyle = ball.bgColor;
        ctx.fill();

        ctx.strokeStyle = 'rgba('+hexToRgb(ball.color).r+','+hexToRgb(ball.color).g+','+hexToRgb(ball.color).b+','+0.4+')';
        ctx.beginPath();
        ctx.moveTo(i, y1 - radius);
        ctx.lineTo(i + 2 * radius + y1 - y2, y2 + radius);
        ctx.moveTo(i + 2 * radius, y2 - radius);
        ctx.lineTo(i + y1 - y2, y1 + radius);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = 'rgba('+hexToRgb(oceanwave.color).r+','+hexToRgb(oceanwave.color).g+','+hexToRgb(oceanwave.color).b+','+0.5+')';
    for ( var i = 0; i < oceanwave.width; i++) {
      var y = amp * Math.sin(phase + freq * i) + yOrigin;
      ctx.lineTo(i, y);
    }
    ctx.lineTo(oceanwave.width,oceanwave.height);
    ctx.lineTo(0,oceanwave.height);
    ctx.closePath();
    ctx.fillStyle = 'rgba('+hexToRgb(oceanwave.bgColor).r+','+hexToRgb(oceanwave.bgColor).g+','+hexToRgb(oceanwave.bgColor).b+','+0.2+')';
    ctx.fill();
    ctx.stroke();
 
    var front_ctx = oceanwave.canvas.getContext("2d");
    front_ctx.clearRect(0, 0, oceanwave.width, oceanwave.height);
    front_ctx.drawImage(oceanwave.buffer, 0, 0);
  }
  
  function drawBackground(bgr){
   	var idx = bgr.idx;
    var width = bgr.width;
    var height = bgr.height;
    
    var canvas = document.getElementById('canvas-'+idx+'-bg');
    var ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgr.bgColor;
    ctx.fillRect(0,0,width,height);
    
    ctx.strokeStyle = bgr.lineColor;
    ctx.strokeWidth = bgr.lineWidth;
    var increment = bgr.increment;
    
    for(var i = 0; i < height/increment; i++){
      ctx.moveTo(0,i*increment);
      ctx.lineTo(width,i*increment);
    }
    
    for(var i = 0; i < width/increment; i++){
      ctx.moveTo(i*increment,0);
      ctx.lineTo(i*increment,height);
    }

    ctx.stroke();
    
  }

  $('ul.menu-list > li > a').click(function(){
    var id = $(this).attr('id');
    if(id == 'single_page') $('.canvas-area').css('top',0);
    if(id == 'inter_page') $('.canvas-area').css('top',-600);
    if(id == 'ocean_page') $('.canvas-area').css('top',-1200);
    if(id == 'about_page') $('.canvas-area').css('top',-1800);
    page = id;

    var current_state = paused[page];
    paused[page] = true;
    setTimeout(function(){ $('.canvas-area').removeClass('slideright'); }, 500);
    setTimeout(function(){ paused[page] = current_state; }, 1000);
  });

  $('.playpause').click(function(){
    if(paused[page]){
      $(this).html('<i class="fa fa-pause"></i>');
      paused[page] = false;
    } else {
      $(this).html('<i class="fa fa-play"></i>');
      paused[page] = true;
    }
    // Handle timer leak
    var allpaused = true;
    for(var p in paused){
      if(!paused[p]) allpaused = false;
    }
    if(allpaused) animateStop();
    else if(timer == null) animateStart();
  });

  $('.trigger-menu').click(function(){
    var current_state = paused[page];
    paused[page] = true;
    if($('.canvas-area').hasClass('slideright')) $('.canvas-area').removeClass('slideright');
    else $('.canvas-area').addClass('slideright');
    setTimeout(function(){ paused[page] = current_state; }, 500);
  });

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
})();