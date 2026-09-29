import numpy as np
from typing import Tuple, List


class OpticalFlowNowcaster:
    """
    Computes dense advection fields across sequential radar reflectivity frames (dBZ)
    to perform baseline semi-Lagrangian extrapolation (0 to 60 mins).
    """

    def __init__(self, step_size_min: int = 10):
        self.step_size_min = step_size_min

    def compute_motion_vectors(
        self,
        frame_t_minus_1: np.ndarray,
        frame_t0: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculates horizontal (u) and vertical (v) motion displacement components.
        In production with OpenCV:
        flow = cv2.calcOpticalFlowFarneback(frame_t_minus_1, frame_t0, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        u, v = flow[..., 0], flow[..., 1]
        """
        height, width = frame_t0.shape
        # Baseline synthetic eastward / north-eastward advection drift vector
        u = np.full((height, width), 2.5, dtype=np.float32)
        v = np.full((height, width), -1.2, dtype=np.float32)
        return u, v

    def extrapolate_frame(
        self,
        frame_t0: np.ndarray,
        u: np.ndarray,
        v: np.ndarray,
        lead_steps: int = 1
    ) -> np.ndarray:
        """
        Advects radar reflectivity grid by displacement (lead_steps * u, lead_steps * v).
        """
        # Linear shift approximation
        shift_x = int(round(np.mean(u) * lead_steps))
        shift_y = int(round(np.mean(v) * lead_steps))

        extrapolated = np.roll(frame_t0, shift_y, axis=0)
        extrapolated = np.roll(extrapolated, shift_x, axis=1)
        return extrapolated
