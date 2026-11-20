# Raio-X de Cabine

Demonstração gratuita para estimar como a ocupação muda o rateio do custo fixo por atendimento. A simulação de exemplo usa somente valores fictícios.

Abra `index.html` em um navegador. Preencha custos e tempo de uma cabine no mesmo mês, escolha três cenários de ocupação e compare a estimativa. A ficha de levantamento ajuda a organizar as premissas.

## Limites e privacidade

O resultado é uma estimativa parcial baseada nos valores informados e em rateio uniforme por tempo. Não calcula lucro, preço recomendado, impostos, taxas de pagamento ou demanda. Não substitui orientação contábil. Não inclua dados de pacientes.

A página não envia nem salva os valores digitados; o cálculo ocorre no navegador. O resultado também mostra as etapas de cada cenário — horas ocupadas, rateio e soma do custo direto — para facilitar a conferência das premissas. Se imprimir ou salvar PDF, proteja a cópia criada.

## Acessibilidade

Quando um campo falha na validação, a mensagem de erro é associada ao campo por `aria-describedby`; ao corrigir os dados, essa associação temporária é removida. Isso melhora a relação programática entre campo e mensagem, mas não comprova compatibilidade com leitores de tela: não houve teste com leitor de tela nem com pessoas.
