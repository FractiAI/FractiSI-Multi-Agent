# LaTeX Preamble

Parsed by the template renderer and injected before Pandoc compiles the combined PDF.

```latex
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{amsthm}
\usepackage{geometry}
\geometry{margin=0.9in,includefoot}
\usepackage{float}
\usepackage{etoolbox}
\usepackage{placeins}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{array}
\usepackage{microtype}
\usepackage{xcolor}
\usepackage{hyperref}
\hypersetup{colorlinks=true,linkcolor=blue!55!black,urlcolor=blue!55!black,citecolor=blue!55!black}
% A longtable set after pending floats can overrun the page, so it flushes them first.
\BeforeBeginEnvironment{longtable}{\FloatBarrier}
\AtBeginEnvironment{longtable}{\small}
% longtable resets the room left on the page and forgets a float already at its top, so
% the next float can overrun the page. The real room is still in \vsize.
\makeatletter\AfterEndEnvironment{longtable}{\global\@colroom\vsize}\makeatother
% A figure placed "here" just after a longtable can overrun the page, so figures float.
\makeatletter\def\fps@figure{tbp}\makeatother
```
