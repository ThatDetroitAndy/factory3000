/**
 * Shared mutable input state for drive mode.
 * Written by keyboard listeners (in DriveMode) and touch buttons (in DriveControls).
 * Read each frame by DriveMode's useFrame loop.
 */
export const driveInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  horn: false,
}
