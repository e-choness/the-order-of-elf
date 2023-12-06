using UnityEngine;

public class FreeCamera : MonoBehaviour
{

    #region Properties

    public float movementSpeed = 1.0f;

    #endregion

    private void Awake()
    {
        Cursor.visible = false;
    }

    private void Update()
    {
        var targetPosition = transform.position + (transform.right * Input.GetAxis("Horizontal") + transform.forward * Input.GetAxis("Vertical")) * movementSpeed;

        transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime);
        transform.eulerAngles += new Vector3(-Input.GetAxis("Mouse Y"), Input.GetAxis("Mouse X"));
    }
}
