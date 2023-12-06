using System;
using System.Collections.Generic;
using UnityEngine;

public enum Ending
{
   Promotion,
   Recognition,
   Demotion
}

public class WinningCriteria : SingletonPersistent<WinningCriteria>
{
   public List<Gift> Gifts = new()
   {
      // Nice gift list
      new Gift() { Name = "Chocolate", Property = GiftProperty.Nice },
      new Gift() { Name = "GiftCard", Property = GiftProperty.Nice },
      new Gift() { Name = "Alan Wake 2", Property = GiftProperty.Nice }, // Yes, I would like a copy of it XD
      
      // Naughty gift list, I'm just making this list up...
      new Gift() { Name = "EMO Chicken", Property = GiftProperty.Naughty },
      new Gift() { Name = "Dirty Gnome", Property = GiftProperty.Naughty },
      new Gift() { Name = "Sticky Sockets", Property = GiftProperty.Naughty }
   };

   public Gift IdealGift => new() { Name = "Alan Wake 2", Property = GiftProperty.Nice };
   public Gift ChosenGift { get; set; }

   public void SaveChoice(Gift gift)
   {
      PlayerPrefs.SetInt(gift.Name, (int)gift.Property);
   }

   public Gift LoadChoice(string giftName)
   {
      var giftProperty = (GiftProperty)PlayerPrefs.GetInt(giftName);
      
      return new Gift() {Name = giftName, Property = giftProperty};
   }

   public Ending DecideEnding(Gift gift)
   {
      if(IdealGift.Name.Equals(ChosenGift.Name))
      {
         if (IdealGift.Property == ChosenGift.Property)
         {
            return Ending.Promotion;
         }
         else
         {
            return Ending.Demotion;
         }
      }
      return Ending.Demotion;
   }

   private void OnDestroy()
   {
      // Wipe playerPrefs when the game ends for now,
      // if we are continue to build the game this line should be deleted.
      PlayerPrefs.DeleteAll();
   }
}
