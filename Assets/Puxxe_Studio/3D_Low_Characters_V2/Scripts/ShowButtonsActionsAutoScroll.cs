
/*XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX
 ----------.----------.----------.----------
(c)	Puxxe Studio | 2022
	16/11/2022 (14:06:43)
 ----------.----------.----------.----------
XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX.XXXXXXXXXX*/
namespace PuxxeStudio{
		
	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;
	using UnityEngine.UI;

	public class ShowButtonsActionsAutoScroll : MonoBehaviour{
		public ScrollRect scrollRect;
		void Start(){
			scrollRect = GetComponent<ScrollRect>();
			ScrollRectToStartPosition();
		}   
		public void ScrollRectToStartPosition(){
			if (scrollRect != null){
				StartCoroutine(AutoScroll(scrollRect, 0, 1, 2f));
			}
		}
		public void ScrollRectToSomePosition(float _startPosition=0, float _endPosition=1, float _duration=2f){
			if (scrollRect != null){
				StartCoroutine(AutoScroll(scrollRect, _startPosition, _endPosition, _duration));
			}
		}
		IEnumerator AutoScroll(ScrollRect _scrollRect, float _startPosition, float _endPosition, float _duration){
			yield return new WaitForSeconds(0.5f);
			float t0 = 0.0f;
			while (t0 <1.0f){
				t0 += Time.deltaTime / _duration;
				_scrollRect.horizontalNormalizedPosition = Mathf.Lerp(_startPosition, _endPosition, t0);
				_scrollRect.verticalNormalizedPosition = Mathf.Lerp(_startPosition, _endPosition, t0);
				yield return null;
			}
		}
		public float GetHorizontalScrollRectPosition(){
			if (scrollRect == null){
				Debug.LogWarning("scrollRect==null!!");
				return 0;
			}
			return scrollRect.horizontalNormalizedPosition;
		}
		public float GetVerticalScrollRectPosition(){
			if (scrollRect==null){
				Debug.LogWarning("scrollRect==null!!");
				return 0;
			}
			return scrollRect.verticalNormalizedPosition;
		}
		public void MoveScrollRectToUp(){
			if (scrollRect == null){
				Debug.LogWarning("scrollRect==null!!");          
			}
			float _startPosition = GetVerticalScrollRectPosition();
			float _endPosition = GetVerticalScrollRectPosition() - 0.1f;
			if (_endPosition < -0.25f){
				return;
			}
			if (scrollRect != null){
				StartCoroutine(AutoScroll(scrollRect, _startPosition, _endPosition, 1.0f));
			}
		}
		public void MoveScrollRectToDown(){
			if (scrollRect == null){
				Debug.LogWarning("scrollRect==null!!");
			}
			float _startPosition = GetVerticalScrollRectPosition();
			float _endPosition = GetVerticalScrollRectPosition() + 0.1f;
			if (_endPosition>1.25f){
				return;
			}
			if (scrollRect != null){
				StartCoroutine(AutoScroll(scrollRect, _startPosition, _endPosition, 1.0f));
			}
		}
	}	
}
