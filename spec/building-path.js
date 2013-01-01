describe('BuildingPath', function() {
	var world;
	var path;
	
	beforeEach(function() {
		world = new World();
		path = new BuildingPath(world, [0,0,0]);
		// Make origin safe
		expect(world.place([0,-1,0], Block.blocks.solid)).toEqual(true);
	});
	
	it('has properties initialized', function() {
		expect(path.world).toEqual(world);
		expect(path.currentWaypoint[0]).toEqual(0);
		expect(path.currentWaypoint[1]).toEqual(0);
		expect(path.currentWaypoint[2]).toEqual(0);
	});
	
	it('allows going little steps', function() {
		expect(world.place([0,-1,1], Block.blocks.solid)).toEqual(true);
		expect(path.setWaypoint([0,0,1])).toEqual(true);
		expect(path.currentWaypoint[2]).toEqual(1);
	});
	
	it('disallows setting waypoint to unsafe positions', function() {
		expect(path.setWaypoint([0,0,1])).toEqual(false);
		expect(path.currentWaypoint[2]).toEqual(0);
	});
	
	it('disallows jumping far', function() {
		expect(world.place([0,-1,100], Block.blocks.solid)).toEqual(true);
		expect(path.setWaypoint([0,0,100])).toEqual(false);
		expect(path.currentWaypoint[2]).toEqual(0);
	});
});
