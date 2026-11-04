# Pipeline

`resolveTemplate` only checks the template checkout and prints what to do. It must not create the view or change anything there. Stages are one script each, so any stage can run alone. `validate.mjs` refuses a checkout under another folder name, because the template derives the expected PDF name from the resolved folder.
