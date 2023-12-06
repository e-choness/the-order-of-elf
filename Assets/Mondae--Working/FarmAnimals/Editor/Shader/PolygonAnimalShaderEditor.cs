using System;
using UnityEditor;
using UnityEngine;

[CanEditMultipleObjects]
public class PolygonAnimalShaderEditor : ShaderGUI
{

    #region Enums

    public enum UvMapKeywords
    {
        UV0,
        UV1,
        UV2,
        UV3
    }

    #endregion

    #region Fields

    private Material targetMat;
    private UvMapKeywords selectedUvMap;

    #endregion

    #region Init

    private void InitializeMatProps()
    {
        for (int i = 0; i <= (int)UvMapKeywords.UV3; i++) {
            if (targetMat.IsKeywordEnabled(((UvMapKeywords)i).ToString())) {
                selectedUvMap = (UvMapKeywords)i;
                break;
            }
        }
    }

    #endregion

    public override void OnGUI(MaterialEditor materialEditor, MaterialProperty[] properties)
    {
        targetMat = materialEditor.target as Material;

        InitializeMatProps();

        EditorGUI.BeginChangeCheck();
        {
            var selected = EditorGUILayout.Popup("UV Channel", (int)selectedUvMap, Enum.GetNames(typeof(UvMapKeywords)));
            if((UvMapKeywords)selected != selectedUvMap) {
                ChangeUvMap((UvMapKeywords)selected);
            }
        }

        base.OnGUI(materialEditor, properties);
    }

    #region Utils

    private void ChangeUvMap(UvMapKeywords uvMap)
    {
        if(targetMat.IsKeywordEnabled(selectedUvMap.ToString())) {
            targetMat.DisableKeyword(selectedUvMap.ToString());
        }
        
        if(!targetMat.IsKeywordEnabled(uvMap.ToString())) {
            targetMat.EnableKeyword(uvMap.ToString());
        }

        selectedUvMap = uvMap;
    }

    #endregion

}
