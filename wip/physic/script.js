var AABB = {
	min: new Vec2(),
	max: new Vec2()
};

function AABBvsAABB(a, b){
	if(a.max.x < b.min.x || a.min.x > b.max.x) return false;
	if(a.max.y < b.min.y || a.min.y > b.max.y) return false;
	
	return true;
}

var Circle = {
	radius: 0,
	position: new Vec2()
};

var CirclevsCircle(a, b){
	var r = a.radius+b.radius;
	r*=r;
	return r < Math.pow(a.x+b.x, 2)+Math.pow(a.y+b.y, 2);
}

/*
V^AB = V^B-V^A
= relative velocity
le vecteur est le résultat de la fin moins le début, 

V^AB*n = (V^B-V^A)*n
n = normal

*/