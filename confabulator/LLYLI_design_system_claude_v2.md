# LLYLI Design System v2
Inputs
1. Language Card Capturing illustration
2. Learn The Language You Live In presentation deck

This version reconciles the illustration palette with the deck palette so your pitch and product feel like the same brand.

All hex values are sampled or derived from the deck and illustration.

## 1. What the deck is actually using
These are the dominant exact colours found in the deck file
* background teal  #0C6B70
* accent coral  #E85C4A
* surface cream  #F8F3E7
* ink text  #1D262A
* white  #FFFFFF

Verdict
The deck palette is slightly more neutral and modern than the illustration. That is good for an app UI.

## 2. Decision on updating the design file
I would update the design file.

Reason
If your deck and your app use different teals and different corals, the brand feels inconsistent fast. Your deck colours are cleaner and more legible, so they should become the app base. The illustration can still live as a warm secondary style layer.

## 3. Updated core palette

### 3.1 Teal scale
* teal_950  #042527
* teal_900  #063638
* teal_800  #084649
* teal_700  #0C6B70  primary background
* teal_600  #38868A
* teal_500  #5A9A9E
* teal_400  #7CAFB2
* teal_300  #9EC4C6
* teal_200  #C0D9DA

### 3.2 Coral scale
* coral_950  #682921
* coral_900  #8B372C
* coral_800  #AE4538
* coral_700  #E85C4A  primary accent
* coral_600  #EB7060
* coral_500  #EE8375
* coral_400  #F0978B
* coral_300  #F4AEA4
* coral_200  #F7C8C1

### 3.3 Cream neutral scale
Use this for most app surfaces
* cream_900  #CCCAC1
* cream_800  #DEDAD0
* cream_700  #F8F3E7  primary surface
* cream_600  #F8F4E8
* cream_500  #F9F4EA
* cream_400  #F9F5EB
* cream_300  #FAF6ED
* cream_200  #FBF7F0
* white  #FFFFFF

### 3.4 Cream warm scale
Use this only for hero moments, illustrations, and special cards
* cream_warm_700  #FFF4D3
* cream_warm_600  #FFF5D7
* cream_warm_500  #FFF6DB

### 3.5 Neutrals
* ink_900  #1D262A  primary text on cream
* ink_700  #6C7275  secondary text
* ink_500  #999D9F  captions and icons on cream

## 4. Updated semantic tokens
* color_background_primary  teal_700
* color_background_elevated  teal_800
* color_surface_primary  cream_700
* color_surface_alt  white
* color_accent_primary  coral_700
* color_text_primary_on_cream  ink_900
* color_text_secondary_on_cream  ink_700
* color_text_on_teal  cream_700
* color_border_soft_on_cream  cream_800
* color_border_accent  coral_700 with opacity 0.35

## 5. Layout and component rules confirmed by the deck
These are aligned with the illustration, so no big changes needed

### 5.1 Core layout language
* strong center alignment on hero screens
* big whitespace
* rounded rectangles everywhere
* simple two column cards for list states

### 5.2 Cards
Deck pattern you should adopt
* card surface  cream_700
* card border  coral_700 at low opacity
* card shadow  subtle, tinted teal_950
* card header bars can be coral_700 with white text for section emphasis

### 5.3 Icons
The deck uses filled icons sometimes, the illustration uses outline icons.
Recommendation
* app navigation and small actions use outline icons with rounded corners
* content illustrations inside cards can use filled icons

## 6. Typography
Deck is readable because it uses high contrast dark text on cream.
Update rule
* default text on cream is ink_900, not teal
* teal is for accents, links, and active states

## 7. Accessibility
Non negotiables
* ink_900 on cream_700 is safe for body text
* cream text on coral should be limited to larger sizes or bold
* coral text on cream is for labels and headers only, not paragraphs

## 8. Machine readable tokens
```json
{
  "teal": {
    "teal_950": "#042527",
    "teal_900": "#063638",
    "teal_800": "#084649",
    "teal_700": "#0C6B70",
    "teal_600": "#38868A",
    "teal_500": "#5A9A9E",
    "teal_400": "#7CAFB2",
    "teal_300": "#9EC4C6",
    "teal_200": "#C0D9DA"
  },
  "coral": {
    "coral_950": "#682921",
    "coral_900": "#8B372C",
    "coral_800": "#AE4538",
    "coral_700": "#E85C4A",
    "coral_600": "#EB7060",
    "coral_500": "#EE8375",
    "coral_400": "#F0978B",
    "coral_300": "#F4AEA4",
    "coral_200": "#F7C8C1"
  },
  "cream_neutral": {
    "cream_900": "#CCCAC1",
    "cream_800": "#DEDAD0",
    "cream_700": "#F8F3E7",
    "cream_600": "#F8F4E8",
    "cream_500": "#F9F4EA",
    "cream_400": "#F9F5EB",
    "cream_300": "#FAF6ED",
    "cream_200": "#FBF7F0",
    "white": "#FFFFFF"
  },
  "cream_warm": {
    "cream_warm_700": "#FFF4D3",
    "cream_warm_600": "#FFF5D7",
    "cream_warm_500": "#FFF6DB"
  },
  "neutral": {
    "ink_900": "#1D262A",
    "ink_700": "#6C7275",
    "ink_500": "#999D9F"
  },
  "semantic": {
    "color_background_primary": "teal_700",
    "color_background_elevated": "teal_800",
    "color_surface_primary": "cream_700",
    "color_surface_alt": "white",
    "color_accent_primary": "coral_700",
    "color_text_primary_on_cream": "ink_900",
    "color_text_secondary_on_cream": "ink_700",
    "color_text_on_teal": "cream_700",
    "color_border_soft_on_cream": "cream_800",
    "color_border_accent": "coral_700_opacity_0_35"
  }
}
```
