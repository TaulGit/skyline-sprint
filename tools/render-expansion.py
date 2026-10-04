import bpy,os,sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(ROOT)
for name in ['car','endurance-coupe','rally-buggy','warning-sign','distant-observatory']:
 bpy.ops.wm.open_mainfile(filepath=os.path.abspath('assets/blender/'+name+'.blend'))
 points=[o.matrix_world@Vector(c) for o in bpy.context.scene.objects if o.type=='MESH' for c in o.bound_box];lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)]);center=(hi+lo)*.5;size=max(hi-lo)
 bpy.ops.object.camera_add();cam=bpy.context.object;cam.location=center+Vector((size*1.2,-size*1.8,size*.85));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=size*1.2;bpy.context.scene.camera=cam
 world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Strength'].default_value=.8;bpy.context.scene.world=world
 for pos,power in [((1,-2,3),1200),((-2,-1,1),800)]:
  bpy.ops.object.light_add(type='AREA',location=center+Vector(pos)*size);light=bpy.context.object;light.data.energy=power*size*size;light.data.shape='DISK';light.data.size=size*2;light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.filepath=os.path.abspath('assets/'+name+'-card.png');bpy.ops.render.render(write_still=True)
print('CARDS_COMPLETE',flush=True);sys.stdout.flush();sys.stderr.flush();os._exit(0)
