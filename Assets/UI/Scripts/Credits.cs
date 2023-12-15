using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Credits : MonoBehaviour
{
    // Start is called before the first frame update
    private Animator mAnimator;
    public Button credz;
    private bool isAnimating;

    void Start()
    {
        mAnimator = GetComponent<Animator>();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void StartAnimation()
    {
        if (!isAnimating)
        {
            mAnimator.SetBool("Start", true);
            isAnimating = true;
        }
    }

    public void StopAnimation()
    {
        mAnimator.SetBool("Start", false);
        isAnimating = false;
        ResetAnimation();
    }

    private void ResetAnimation()
    {
        mAnimator.Play("Credit Animation", -1, 0f);
    }
}

