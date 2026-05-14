# Robot Kit Build Instructions

A minimal static GitHub Pages site for step-by-step robot kit build instructions.

## Preview locally

Run a local static server from this folder:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Edit steps

Steps are stored in `steps.json`. Each item has:

```json
{
  "title": "Attach the base plate",
  "description": "Place the base plate flat on the table with the mounting holes facing up.",
  "image": "images/step-02.png",
  "alt": "Robot base plate positioned for assembly"
}
```

To reorder steps, move the objects up or down in the array. The site displays steps in the exact order listed.

## Add images

Place images in `images/` and reference them from `steps.json` with a relative path such as:

```json
"image": "images/step-03.png"
```

Use short, descriptive `alt` text for accessibility and for cases where an image cannot load.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Set the source to the main branch and root folder.
4. Save and wait for GitHub Pages to publish the site.

No build step is required.
# Kitbot2026Instructions
