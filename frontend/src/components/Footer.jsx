/**
 * Footer — slim dark band displayed at the bottom of every page.
 */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="prestige-footer mt-5 pt-5 pb-4">
      <div className="container">
        <div className="row gy-4">
          <div className="col-md-4">
            <h5 className="fw-bold mb-2">
              <i className="bi bi-suit-diamond-fill me-2" style={{ color: 'var(--gold)' }} />
              Prestige <span style={{ color: 'var(--gold)' }}>Auto</span>
            </h5>
            <p className="small text-secondary mb-0">
              La location de véhicules d'exception au Maroc. Sportives,
              berlines de luxe et SUV haut de gamme, livrés à votre porte.
            </p>
          </div>

          <div className="col-md-3">
            <h6 className="text-uppercase small fw-bold text-secondary">Navigation</h6>
            <ul className="list-unstyled small">
              <li><a href="/" className="text-decoration-none text-light">Accueil</a></li>
              <li><a href="/vehicles" className="text-decoration-none text-light">Catalogue</a></li>
              <li><a href="/agencies" className="text-decoration-none text-light">Agences</a></li>
            </ul>
          </div>

          <div className="col-md-3">
            <h6 className="text-uppercase small fw-bold text-secondary">Mon compte</h6>
            <ul className="list-unstyled small">
              <li><a href="/login" className="text-decoration-none text-light">Connexion</a></li>
              <li><a href="/register" className="text-decoration-none text-light">Inscription</a></li>
            </ul>
          </div>

          <div className="col-md-2">
            <h6 className="text-uppercase small fw-bold text-secondary">Contact</h6>
            <p className="small text-light mb-0">
              <i className="bi bi-telephone me-1" /> +212 522 11 22 33<br />
              <i className="bi bi-envelope me-1" /> contact@prestige-auto.ma
            </p>
          </div>
        </div>

        <hr className="border-secondary mt-4" />
        <p className="small text-secondary mb-0 text-center">
          &copy; {year} Prestige Auto. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}
