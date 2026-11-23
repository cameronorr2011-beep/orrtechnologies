"""Render the VoidBuilds 3D loop: a chrome knot lit by two rim lights,
turning once over 48 frames on pure black.

Black background on purpose. The result is composited with `screen` blending
on the site, so it lifts out of any dark plate without an alpha channel, and
GIF stays a single opaque palette.

    blender --background --python tools/motion/orb.py -- <outdir> <frames> <res>
"""
import math
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
outdir = argv[0] if argv else "studio-out/motion/orb"
frames = int(argv[1]) if len(argv) > 1 else 48
res = int(argv[2]) if len(argv) > 2 else 640

# --- clean slate -----------------------------------------------------------
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 16
scene.cycles.use_denoising = True
scene.cycles.device = "CPU"
scene.render.resolution_x = res
scene.render.resolution_y = res
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGB"
scene.render.filepath = outdir.rstrip("/") + "/orb_"
scene.frame_start = 1
scene.frame_end = frames
scene.render.fps = 24

# --- world: near-black, faint blue ----------------------------------------
world = bpy.data.worlds.new("Void")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.004, 0.005, 0.012, 1.0)
bg.inputs[1].default_value = 1.0

# --- the object: a (2,3) torus knot in polished metal ---------------------
# There is no primitive_torus_knot operator in stock Blender, so the knot is a
# poly curve sampled from the parametric equation and bevelled into a tube.
P, Q, STEPS, SCALE = 2, 3, 720, 0.34
curve = bpy.data.curves.new("VoidKnotCurve", type="CURVE")
curve.dimensions = "3D"
curve.bevel_depth = 0.20
curve.bevel_resolution = 8
curve.resolution_u = 24
spline = curve.splines.new("POLY")
spline.points.add(STEPS - 1)
for i in range(STEPS):
    t = i / STEPS * math.tau
    ring = 2.0 + math.cos(Q * t / P)
    spline.points[i].co = (
        ring * math.cos(t) * SCALE,
        ring * math.sin(t) * SCALE,
        math.sin(Q * t / P) * SCALE,
        1.0,
    )
spline.use_cyclic_u = True
knot = bpy.data.objects.new("VoidKnot", curve)
scene.collection.objects.link(knot)
for poly in curve.splines:
    poly.use_smooth = True

mat = bpy.data.materials.new("Chrome")
mat.use_nodes = True
bsdf = mat.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (0.85, 0.88, 1.0, 1.0)
bsdf.inputs["Metallic"].default_value = 1.0
bsdf.inputs["Roughness"].default_value = 0.14
if "Coat Weight" in bsdf.inputs:
    bsdf.inputs["Coat Weight"].default_value = 0.6
knot.data.materials.append(mat)

# No emissive core: Cycles has no bloom, so a white sphere just reads as a
# sticker stuck to the metal. The empty hole is the better silhouette.

# --- lights: two cold rims and one warm kiss ------------------------------
def area(name, loc, energy, size, colour):
    light = bpy.data.lights.new(name, type="AREA")
    light.energy = energy
    light.size = size
    light.color = colour
    obj = bpy.data.objects.new(name, light)
    obj.location = loc
    scene.collection.objects.link(obj)
    track = obj.constraints.new(type="TRACK_TO")
    track.target = knot
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    return obj

area("RimBlue", (2.6, -2.2, 2.4), 900, 2.2, (0.55, 0.68, 1.0))
area("RimCoral", (-2.8, -1.4, 1.2), 520, 2.0, (1.0, 0.42, 0.28))
area("Top", (0.4, 2.4, 3.0), 380, 2.6, (1.0, 0.95, 0.86))

# --- camera ---------------------------------------------------------------
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 55
cam = bpy.data.objects.new("Cam", cam_data)
# Far enough back that the widest pose of the knot still clears the frame with
# margin to spare; at 68mm the tube clipped the left edge as it turned.
cam.location = (0.0, -4.75, 0.40)
scene.collection.objects.link(cam)
scene.camera = cam
track = cam.constraints.new(type="TRACK_TO")
track.target = knot
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

# --- one clean revolution: first and last frame are identical -------------
# The loop is 1..frames, so frame `frames` must equal frame 1 with a full turn
# offset that the GIF's wrap hides. Rotating by `i / frames` keeps the seam
# invisible because the last rendered frame is one step short of the start.
knot.rotation_mode = "XYZ"
for i in range(frames):
    frame = i + 1
    # Evaluate the frame BEFORE writing the pose. frame_set re-evaluates the
    # action, so doing it after the assignment silently overwrites the pose and
    # every key ends up identical.
    scene.frame_set(frame)
    t = i / frames
    knot.rotation_euler = (
        # A permanent 34deg lean keeps the ring from ever turning edge-on into
        # an unreadable sliver as it revolves.
        math.radians(34) + math.radians(9) * math.sin(t * math.tau),
        math.radians(-8) + math.radians(13) * math.cos(t * math.tau),
        # A (2,3) knot maps onto itself every 120deg, so turning by exactly one
        # third is a full visual cycle — and the wrap point is pixel-identical.
        t * (math.tau / 3),
    )
    knot.keyframe_insert("rotation_euler", frame=frame)

for action in (knot.animation_data.action,):
    for fc in action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"

print(f"rendering {frames} frames at {res}px -> {outdir}")
bpy.ops.render.render(animation=True)
print("done")
