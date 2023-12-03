using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SandBlast : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        StartCoroutine(Destroy());
    }

    // Update is called once per frame
    void Update()
    {

    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("AI"))
        {
            other.GetComponent<AIController>().ResetDetection();
            Destroy(gameObject);
        }
    }

    IEnumerator Destroy()
    {
        yield return new WaitForSeconds(2);
        Destroy(gameObject);
    }
}
