<template>
  <div class="container-fluid px-4 py-4">
    <div class="row justify-content-center">
      <div class="col-lg-10 col-xl-8">
        <!-- Header -->
        <div class="text-center mb-5">
          <h1 class="fw-bold text-mint mb-3">Guia de Reciclagem de Eletrônicos</h1>
          <p class="lead text-muted">Saiba o que pode ser reciclado, como preparar seus dispositivos e por que isso é vital para o planeta.</p>
        </div>

        <!-- Cards Grid -->
        <div class="row g-4 mb-5">
          <!-- O que é -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="rounded-circle bg-mint-light p-3 text-mint d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                    <i class="bi bi-question-lg fs-4"></i>
                  </div>
                  <h4 class="fw-bold mb-0 text-dark">O que é Lixo Eletrônico?</h4>
                </div>
                <p class="text-muted">
                  Também conhecido como <strong>e-lixo</strong>, abrange qualquer equipamento elétrico ou eletrônico descartado, incluindo pilhas e baterias. O descarte inadequado libera substâncias tóxicas (como mercúrio e chumbo) que contaminam o solo e a água.
                </p>
              </div>
            </div>
          </div>

          <!-- Por que reciclar -->
          <div class="col-md-6">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="rounded-circle bg-mint-light p-3 text-mint d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                    <i class="bi bi-globe-americas fs-4"></i>
                  </div>
                  <h4 class="fw-bold mb-0 text-dark">Por que reciclar?</h4>
                </div>
                <p class="text-muted">
                  A reciclagem recupera materiais valiosos como ouro, prata, cobre e plásticos, reduzindo a necessidade de extração de novos recursos. Além disso, evita que metais pesados prejudiquem a saúde pública e o meio ambiente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- O que pode ser reciclado -->
        <div class="card border-0 shadow-sm mb-5 overflow-hidden">
          <div class="card-header bg-mint text-white p-4">
            <h4 class="fw-bold mb-0"><i class="bi bi-check-circle-fill me-2"></i>O que pode ser reciclado?</h4>
          </div>
          <div class="card-body p-4">
            <div class="row g-4">
              <div class="col-md-4">
                <h5 class="fw-bold text-mint mb-3">Computadores e Periféricos</h5>
                <ul class="list-unstyled text-muted d-grid gap-2">
                  <li><i class="bi bi-dot text-mint"></i> Desktops e Notebooks</li>
                  <li><i class="bi bi-dot text-mint"></i> Monitores e Teclados</li>
                  <li><i class="bi bi-dot text-mint"></i> Mouses e Impressoras</li>
                  <li><i class="bi bi-dot text-mint"></i> Estabilizadores e Nobreaks</li>
                </ul>
              </div>
              <div class="col-md-4">
                <h5 class="fw-bold text-mint mb-3">Dispositivos Móveis</h5>
                <ul class="list-unstyled text-muted d-grid gap-2">
                  <li><i class="bi bi-dot text-mint"></i> Celulares e Smartphones</li>
                  <li><i class="bi bi-dot text-mint"></i> Tablets e Kindles</li>
                  <li><i class="bi bi-dot text-mint"></i> Carregadores e Cabos</li>
                  <li><i class="bi bi-dot text-mint"></i> Fones de Ouvido</li>
                </ul>
              </div>
              <div class="col-md-4">
                <h5 class="fw-bold text-mint mb-3">Eletrodomésticos e Outros</h5>
                <ul class="list-unstyled text-muted d-grid gap-2">
                  <li><i class="bi bi-dot text-mint"></i> Televisores e Câmeras</li>
                  <li><i class="bi bi-dot text-mint"></i> Consoles de Videogame</li>
                  <li><i class="bi bi-dot text-mint"></i> Pilhas e Baterias</li>
                  <li><i class="bi bi-dot text-mint"></i> Roteadores e Modems</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Como preparar -->
        <div class="card border-0 shadow-sm mb-5">
          <div class="card-body p-4">
            <h4 class="fw-bold text-dark mb-4">Como preparar seus dispositivos</h4>
            <div class="row g-4">
              <div class="col-md-4 text-center">
                <div class="mb-3 text-mint"><i class="bi bi-eraser-fill display-4"></i></div>
                <h6 class="fw-bold">Apague seus Dados</h6>
                <p class="small text-muted">Faça backup e restaure as configurações de fábrica em celulares e computadores para proteger sua privacidade.</p>
              </div>
              <div class="col-md-4 text-center">
                <div class="mb-3 text-mint"><i class="bi bi-battery-charging display-4"></i></div>
                <h6 class="fw-bold">Remova Baterias</h6>
                <p class="small text-muted">Se possível, remova pilhas e baterias soltas. Elas devem ser descartadas em coletores específicos.</p>
              </div>
              <div class="col-md-4 text-center">
                <div class="mb-3 text-mint"><i class="bi bi-box-seam display-4"></i></div>
                <h6 class="fw-bold">Não Desmonte</h6>
                <p class="small text-muted">Evite desmontar equipamentos complexos para não se expor a componentes perigosos ou cortantes.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <h4 class="fw-bold mb-3">Pronto para fazer a diferença?</h4>
          <p class="text-muted mb-4">Localize o ponto de coleta mais próximo e descarte seus resíduos de forma responsável.</p>
          <div class="d-flex justify-content-center gap-3">
            <router-link to="/pontos" class="btn btn-outline-mint btn-lg fw-bold">
              <i class="bi bi-map-fill me-2"></i>Encontrar Pontos
            </router-link>
            <router-link to="/cadastro-dispositivo" class="btn btn-mint btn-lg fw-bold">
              <i class="bi bi-recycle me-2"></i>Realizar Descarte
            </router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.text-mint { color: #10b981 !important; }
.bg-mint { background-color: #10b981 !important; }
.bg-mint-light { background-color: #d1fae5 !important; } /* Mint-100 */

.btn-mint {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}
.btn-mint:hover {
  background-color: #059669;
  border-color: #059669;
  color: white;
}

.btn-outline-mint {
  color: #10b981;
  border-color: #10b981;
  background: transparent;
}
.btn-outline-mint:hover {
  background-color: #10b981;
  color: white;
}
</style>
