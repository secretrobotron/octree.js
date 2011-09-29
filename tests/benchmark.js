(function () {

  function Benchmark( name, functions ) {

    var times = [],
        benchFunc = functions.benchmark,
        setupFunc = functions.setup,
        repeat = functions.repeat || 1,
        averageSum = 0,
        options = {};

    this.run = function() {
      var startTime, endTime;
      for ( var i=0; i<repeat; ++i ) {
        startTime = Date.now();
        benchFunc( options );
        endTime = Date.now();
        averageSum += endTime - startTime;
        times.push( endTime - startTime );
      } //for
    }; //run

    this.setup = function() {
      setupFunc( options );
    }; //setup

    Object.defineProperty( this, "times", {
      get: function() { return times; }
    });
    Object.defineProperty( this, "name", {
      get: function() { return name; }
    });
    Object.defineProperty( this, "average", {
      get: function() { return averageSum/repeat; }
    });
    Object.defineProperty( this, "skip", {
      get: function() { return functions.skip; }
    });

  } //Benchmark

  function BenchmarkPool( listId ) {

    var benchmarks = [],
        listContainer = document.getElementById( listId );

    this.add = function( benchmark ) {
      benchmarks.push( benchmark );
    }; //add

    this.run = function() {
      for ( var i=0,l=benchmarks.length; i<l; ++i ) {
        if ( benchmarks[ i ].skip ) continue;
        benchmarks[ i ].setup();
        benchmarks[ i ].run();
        var resultRow = document.createElement( 'tr' ),
            title = document.createElement( 'td' ),
            time = document.createElement( 'td' );
            average = document.createElement( 'td' );
        title.appendChild( document.createTextNode( benchmarks[ i ].name ) );
        title.className = "benchmark-title";
        time.appendChild( document.createTextNode( benchmarks[ i ].times ) );
        time.className = "benchmark-time";
        average.appendChild( document.createTextNode( benchmarks[ i ].average ) );
        average.className = "benchmark-average";
        resultRow.appendChild( title );
        resultRow.appendChild( time );
        resultRow.appendChild( average );
        resultRow.className = "benchmark-result";
        listContainer.appendChild( resultRow );
      } //for
    }; //run
  }  //BenchmarkPool 

  document.addEventListener( 'DOMContentLoaded', function( e ) {

    var pool = new BenchmarkPool( 'benchmarks' );
    
    pool.add( new Benchmark( "Insert Node", {
      skip: false,
      repeat: 6,
      setup: function( options ) {
        var octree = new Octree({
          size: 1000,
          depth: 4
        });

        var nodes = [];
        for ( var i=0; i<1000; ++i ) {
          var min = [
                -1000 + Math.random()*1500,
                -1000 + Math.random()*1500,
                -1000 + Math.random()*1500
              ],
              max = [
                min[ 0 ] + Math.random() * 500,
                min[ 1 ] + Math.random() * 500,
                min[ 2 ] + Math.random() * 500
              ];
          nodes.push( new Octree.Node({
            object: {
              foo: "bar"
            },
            aabb: [ min, max ],
            inserted: function( subtree ) {
            }
          }));
        } //for

        options.octree = octree;
        options.nodes = nodes;
      },
      benchmark: function( options ) {
        var octree = options.octree,
            nodes = options.nodes;

        for ( var i=0, l=nodes.length; i<l; ++i ) {
          octree.insert( nodes[ i ] );
        } //for
      }
    }));

    pool.add( new Benchmark( "Adjust Node", {
      repeat: 6,
      setup: function( options ) {
        var octree = new Octree({
          size: 1000,
          depth: 4
        });

        var nodes = [];
        for ( var i=0; i<100; ++i ) {
          var min = [
                -1000 + Math.random()*1500,
                -1000 + Math.random()*1500,
                -1000 + Math.random()*1500
              ],
              max = [
                min[ 0 ] + Math.random() * 500,
                min[ 1 ] + Math.random() * 500,
                min[ 2 ] + Math.random() * 500
              ];
          nodes.push( new Octree.Node({
            object: {
              foo: "bar"
            },
            aabb: [ min, max ],
            inserted: function( subtree ) {
            }
          }));
        } //for

        for ( var i=0, l=nodes.length; i<l; ++i ) {
          octree.insert( nodes[ i ] );
        } //for

        var positions = [];
        for ( var i=0, l=nodes.length*6; i<l; ++i ) {
          var min = [
              -1000 + Math.random()*1500,
              -1000 + Math.random()*1500,
              -1000 + Math.random()*1500
            ],
            max = [
              min[ 0 ] + Math.random() * 500,
              min[ 1 ] + Math.random() * 500,
              min[ 2 ] + Math.random() * 500
            ];
          positions.push( [ min, max ] );
        } //for

        options.octree = octree;
        options.nodes = nodes;
        options.positions = positions;
      },
      benchmark: function( options ) {
        var octree = options.octree,
            nodes = options.nodes,
            positions = options.positions;

        for ( var i=0, l=nodes.length; i<l; ++i ) {
          nodes[ i ].aabb = positions.pop();
          nodes[ i ].adjust();
        } //for
      }
    }));

    pool.run();

  }, false );

})();
