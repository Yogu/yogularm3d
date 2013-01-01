describe('World', function() {
	var world;
	
	beforeEach(function() {
		world = new World();
	});
	
	it('should be empty after creation', function() {
		expect(world.getIDAt([0,0,0])).toEqual(0);
	});
	
	it('allows putting objects', function() {
		world.place([0,0,0], Block.blocks.solid);
		expect(world.getIDAt([0,0,0])).toEqual(1);
	});
	
	it('keeps objects after pushing', function() {
		world.place([0,0,0], Block.blocks.solid);
		world.push();
		expect(world.getIDAt([0,0,0])).toEqual(1);
	});
	
	it('allows to add objects after pushing', function() {
		world.place([0,0,0], Block.blocks.solid);
		world.push();
		world.place([1,0,0], Block.blocks.solid);
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(1);
	});
	
	it('keeps changes after calling popAndApply', function() {
		world.place([0,0,0], Block.blocks.solid);
		world.push();
		world.place([1,0,0], Block.blocks.solid);
		world.popAndApply();
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(1);
	});
	
	it('discards changes after calling popAndKeep', function() {
		world.place([0,0,0], Block.blocks.solid);
		world.push();
		world.place([1,0,0], Block.blocks.solid);
		world.popAndDiscard();
		expect(world.getIDAt([0,0,0])).toEqual(1);
		expect(world.getIDAt([1,0,0])).toEqual(0);
	});
});
