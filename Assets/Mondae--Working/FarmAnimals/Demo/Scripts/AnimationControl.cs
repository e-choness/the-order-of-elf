using System.Collections;
using UnityEngine;

[RequireComponent(typeof(Animator))]
public class AnimationControl : MonoBehaviour
{

    #region Constnats

    private const string ANIMATION_KEY = "AnimationState";

    #endregion

    #region Fields

    private Animator animator;

    #endregion

    #region Properties

    public int animationIndex;
    public float animationDelay = 0.0f;

    #endregion

    #region Init

    private void Awake()
    {
        animator = GetComponent<Animator>();

        StartCoroutine(DelayedAnimation(animationDelay, animationIndex));
    }

    #endregion

    #region Utils

    private IEnumerator DelayedAnimation(float delay, int animationIndex)
    {
        yield return new WaitForSeconds(delay);
        animator.SetInteger(ANIMATION_KEY, animationIndex);
    }

    #endregion

}
