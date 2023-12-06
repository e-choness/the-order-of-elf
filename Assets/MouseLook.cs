using UnityEngine;

public class MouseLook : MonoBehaviour
{
    public float mouseSensitivity = 100f; // Sensitivity of the mouse
    public Transform playerBody; // Reference to the player body to rotate

    private float xRotation = 0f; // Rotation around the X axis

    void Start()
    {
        // Locks the cursor to the center of the screen
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        // Get mouse movement inputs
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        // Rotate the camera up and down (but don't allow it to flip over)
        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);

        // Apply the rotations
        transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
        playerBody.Rotate(Vector3.up * mouseX);
    }
}
