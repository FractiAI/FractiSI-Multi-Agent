# Formal model {#sec:formalism}

The results below turn on a few simple identities. Stating them first makes clear which outcomes follow from arithmetic and which needed a measurement.

::: {.definition #def:reduction}
For a conventional representation of size $B$ and an alternative of size $T$, the *reduction* is $R = 1 - T/B$. A representation is *lossless* for a workload if every original record can be rebuilt from it exactly.
:::

::: {.definition #def:shared_fraction}
Suppose each of $n$ sessions holds $S$ bytes that are identical across sessions and $D$ bytes of its own. The *shared fraction* is $f = S/(S+D)$.
:::

::: {.proposition #prop:saturation}
If the shared bytes are stored once with no overhead, then
$$
R(n) = f\left(1 - \frac{1}{n}\right).
$$ {#eq:saturation}
Hence $R(n) < f$ for every $n$, and a target reduction $\tau$ is reachable only if $f > \tau$.
:::

To see this, take $B = n(S+D)$ and $T = S + nD$. Then $1 - T/B = S(n-1)/\bigl(n(S+D)\bigr)$, which is [@eq:saturation]. Two consequences matter in practice. More sessions help only up to the ceiling $f$. And because $D$ grows with every turn of a conversation while $S$ does not, $f$ and therefore the available saving fall as sessions age.

::: {.definition #def:aggregate}
Across workloads with sizes $B_i$ and $T_i$, the *byte-weighted aggregate* is
$$
A = 1 - \frac{\sum_i T_i}{\sum_i B_i} = \sum_i w_i R_i, \qquad w_i = \frac{B_i}{\sum_j B_j}.
$$ {#eq:aggregate}
:::

By [@eq:aggregate], the aggregate is a weighted mean in which each workload counts in proportion to its baseline size. A workload's size is an arbitrary parameter of that workload, so the aggregate can be moved without changing any individual result.

For a transformer with $L$ layers, $H$ attention heads, head dimension $d$ and $s$ bytes per element, key and value tensors per layer give $k = 2LHds$ bytes per token, an accounting the real-model lab checks against the tensors themselves. With a prefix of $P$ tokens shared by $n$ sessions that each add $Q$ tokens,
$$
K_{\mathrm{dup}} = n(P+Q)k, \qquad K_{\mathrm{shared}} = (P+nQ)k,
$$ {#eq:kv}
which is [@prop:saturation] with $S = Pk$ and $D = Qk$. Model weights of $W$ bytes are resident under both designs, so the reduction in total resident memory is
$$
R_W = 1 - \frac{W + K_{\mathrm{shared}}}{W + K_{\mathrm{dup}}}.
$$ {#eq:with_weights}
The weights dilute the saving, and they dilute it most where the KV cache is small relative to the model.
