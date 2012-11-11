describe('World', function() {
	var world;
	
	beforeEach(function() {
		world = new World();
	});
	
	it('should be empty after creation', function() {
		expect(world.getIDAt([0,0,0])).toEqual(0);
	});
	
	it('allows putting objects', function() {
		world.setIDAt([0,0,0], 1);
		expect(world.getIDAt([0,0,0])).toEqual(1);
	});
	
	it('keeps objects after pushing', function() {
		world.setIDAt([0,0,0], 1);
		world.push();
		expect(world.getIDAt([0,0,0])).toEqual(1);
	});
	
	it('allows to add objects after pushing', function() {
		world.setIDAt([0,0,0], 1);
		world.push();
		world.setIDAt([1,0,0], 1);
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(1);
	});
	
	it('keeps changes after calling popAndApply', function() {
		world.setIDAt([0,0,0], 1);
		world.push();
		world.setIDAt([1,0,0], 1);
		world.popAndApply();
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(1);
	});
	
	it('discards changes after calling popAndKeep', function() {
		world.setIDAt([0,0,0], 1);
		world.push();
		world.setIDAt([1,0,0], 1);
		world.popAndDiscard();
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(0);
	});
});
