export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingMinutes: number;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "trouver-partenaires-sport-pres-de-chez-soi-2026",
    title: "Comment trouver des partenaires de sport près de chez soi en 2026",
    description:
      "Padel à 3, foot à 9, sortie trail en solo… Nos conseils pour trouver facilement des partenaires de sport près de chez vous, autour du Léman et des Alpes.",
    date: "2026-11-14",
    readingMinutes: 5,
    sections: [
      {
        paragraphs: [
          "Vous avez réservé un terrain de padel mais il manque un joueur. Votre équipe de five est à 8 et personne n'est dispo jeudi soir. Vous aimeriez faire cette sortie trail au-dessus du lac, mais pas tout seul. Si l'une de ces situations vous parle, vous n'êtes pas seul : trouver des partenaires de sport près de chez soi reste l'un des premiers freins à la pratique régulière.",
          "Bonne nouvelle : en 2026, il n'a jamais été aussi simple de trouver des sportifs de votre niveau à quelques kilomètres. Voici comment.",
        ],
      },
      {
        heading: "Le problème : des sportifs partout, mais impossibles à trouver",
        paragraphs: [
          "Autour du Léman et des Alpes, entre Annecy, Genève, Lausanne et le Chablais, des milliers de personnes pratiquent le padel, le foot, le running ou le badminton. Pourtant, quand il faut trouver un partenaire, on se retrouve souvent à :",
        ],
        list: [
          "relancer le même groupe WhatsApp où personne ne répond ;",
          "poster sur des réseaux sociaux où l'annonce est noyée en quelques heures ;",
          "dépendre d'un club, avec des horaires imposés et une cotisation annuelle ;",
          "renoncer, tout simplement, et rester sur le canapé.",
        ],
      },
      {
        paragraphs: [
          "Le vrai problème n'est pas le manque de sportifs, c'est le manque d'un endroit où ils se retrouvent, avec les bonnes infos : quel sport, où, quand, à quel niveau.",
        ],
      },
      {
        heading: "La solution : SportVoisin, les annonces sportives de proximité",
        paragraphs: [
          "SportVoisin a été pensé pour ça. Le principe est simple : vous publiez une annonce (« Padel samedi 10h à Annecy, il manque un joueur niveau intermédiaire ») ou vous rejoignez celle d'un autre sportif. Les annonces sont triées par distance, pour voir d'abord ce qui se passe près de chez vous.",
          "Quelques fonctionnalités qui font la différence :",
        ],
        list: [
          "Autour de moi : activez la géolocalisation et les annonces les plus proches remontent en premier.",
          "Sportifs autour de moi : découvrez les sportifs inscrits dans un rayon de 50 km et proposez-leur un match en un clic.",
          "Alertes email : choisissez vos sports, votre rayon et vos créneaux, et recevez un email dès qu'une activité correspondante est publiée. C'est gratuit et on se désabonne à tout moment.",
          "Messagerie : échangez avec l'organisateur pour caler les derniers détails.",
          "Niveaux : chaque annonce précise le niveau attendu, pour des parties équilibrées.",
        ],
      },
      {
        heading: "Les sports disponibles",
        paragraphs: [
          "SportVoisin couvre les sports collectifs et les sports outdoor les plus pratiqués dans la région :",
        ],
        list: [
          "Sports de raquette : padel, badminton (et tennis via « Autre sport »).",
          "Sports collectifs : football à 5, futsal, basket, volley.",
          "Outdoor : trail et running, vélo de route, randonnée.",
        ],
      },
      {
        paragraphs: [
          "Votre sport n'est pas dans la liste ? L'option « Autre sport » permet de publier n'importe quelle activité.",
        ],
      },
      {
        heading: "Les villes couvertes",
        paragraphs: [
          "SportVoisin est né autour du Léman et des Alpes, des deux côtés de la frontière. Vous y trouverez des annonces notamment à Annecy, Genève, Lausanne, Thonon-les-Bains, Évian-les-Bains, Chambéry, Albertville, Cluses, Bonneville, Nyon, Morges, Rolle, Gland et Divonne-les-Bains. Et partout ailleurs : dès qu'un sportif publie une annonce, sa ville est sur la carte.",
        ],
      },
      {
        heading: "Nos conseils pour une annonce qui trouve preneur",
        paragraphs: [],
        list: [
          "Soyez précis : lieu exact, heure, durée, nombre de places.",
          "Indiquez le niveau : c'est le critère n°1 pour que tout le monde passe un bon moment.",
          "Publiez tôt : 2 à 3 jours à l'avance laissent le temps aux alertes de faire leur travail.",
          "Répondez vite aux messages : un partenaire motivé n'attend pas.",
        ],
      },
      {
        heading: "Prêt à trouver vos partenaires ?",
        paragraphs: [
          "L'inscription prend une minute et elle est gratuite. Renseignez votre ville et vos sports, activez les alertes, et laissez les matchs venir à vous.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
