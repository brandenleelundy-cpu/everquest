import { Heart, Shield, Star, Crown, Check, ExternalLink, Snowflake } from 'lucide-react';

const PATREON_URL = 'https://www.patreon.com/frostreaver';

const tiers = [
  {
    name: 'Adventurer',
    price: '$3',
    period: 'per month',
    icon: <Shield className="h-6 w-6" />,
    color: 'border-frost-ice-500/60 bg-frost-ice-800/30',
    headerColor: 'text-frost-steel-100',
    badgeColor: 'border-frost-ice-500/50 bg-frost-ice-800/50 text-frost-steel-200',
    perks: [
      'Supporter badge in Discord',
      'Early wiki update previews',
      'Access to the #patrons channel',
    ],
  },
  {
    name: 'Champion',
    price: '$8',
    period: 'per month',
    icon: <Star className="h-6 w-6" />,
    featured: true,
    color: 'border-frost-rime-400/60 bg-frost-ice-800/50 shadow-[0_0_60px_-12px_rgba(111,196,232,0.35)]',
    headerColor: 'text-frost-rime-100',
    badgeColor: 'border-frost-rime-400/60 bg-frost-rime-400/10 text-frost-rime-200',
    perks: [
      'Everything in Adventurer',
      'Name listed on the wiki',
      'Vote on next wiki content',
      'Champion role in Discord',
    ],
  },
  {
    name: 'Legend',
    price: '$20',
    period: 'per month',
    icon: <Crown className="h-6 w-6" />,
    color: 'border-frost-gold-400/60 bg-frost-ice-800/30',
    headerColor: 'text-frost-gold-300',
    badgeColor: 'border-frost-gold-400/50 bg-frost-gold-400/10 text-frost-gold-300',
    perks: [
      'Everything in Champion',
      'Featured in the Hall of Legends',
      'Direct input on server guides',
      'Legend role in Discord',
      'Monthly shoutout in the wiki',
    ],
  },
];

// Hall of Legends — placeholder patrons; real names would come from Patreon API / manual update
const legends = [
  'Galinth the Unwavering',
  'Ssynthara',
  'Bourdain of Faydwer',
  'Krix',
  'Velindra Frostwhisper',
  'Zorroth',
];

export default function Patreon() {
  return (
    <section id="support" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 font-serif text-sm font-medium uppercase tracking-[0.4em] text-frost-rime-300">
            Keep the Wiki Alive
          </p>
          <h2 className="font-display text-4xl font-bold text-frost-rime-50 text-glow-ice sm:text-5xl">
            Support Frostreaver
          </h2>
          <div className="divider-ornate mx-auto mt-6 max-w-xs">
            <Heart className="h-4 w-4 text-frost-ember-400" />
            <span className="font-serif text-xs uppercase tracking-[0.3em]">On Patreon</span>
            <Heart className="h-4 w-4 text-frost-ember-400" />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-frost-steel-100/80">
            The Frostreaver Wiki is maintained entirely by volunteers. Your support keeps the
            servers running, the content updated, and the lights on in Norrath. Every platinum
            piece counts.
          </p>
        </div>

        {/* Tier cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`panel panel-hover relative flex flex-col rounded-xl border p-7 transition-all duration-500 ${tier.color} ${
                tier.featured ? '-translate-y-2' : ''
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="chip border-frost-rime-400/60 bg-frost-ice-900 text-frost-rime-200">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier icon + name */}
              <div className={`mb-5 flex items-center gap-3 ${tier.headerColor}`}>
                <span
                  className={`grid h-11 w-11 place-items-center rounded-full border ${tier.badgeColor}`}
                >
                  {tier.icon}
                </span>
                <div>
                  <div className="font-display text-base font-bold">{tier.name}</div>
                  <div className="font-serif text-[10px] uppercase tracking-widest text-frost-steel-400">
                    Supporter Tier
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className={`font-display text-4xl font-bold ${tier.headerColor}`}>
                  {tier.price}
                </span>
                <span className="ml-1 font-sans text-sm text-frost-steel-400">{tier.period}</span>
              </div>

              {/* Perks */}
              <ul className="mb-8 flex-1 space-y-3">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-frost-rime-400" />
                    <span className="font-sans text-sm text-frost-steel-200">{perk}</span>
                  </li>
                ))}
              </ul>

              <a
                href={PATREON_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  tier.featured
                    ? 'btn-ice flex items-center justify-center gap-2'
                    : 'btn-ghost flex items-center justify-center gap-2'
                }
              >
                <ExternalLink className="h-4 w-4" />
                Become a {tier.name}
              </a>
            </div>
          ))}
        </div>

        {/* Why support / what it pays for */}
        <div className="panel mb-12 grid gap-8 p-8 sm:grid-cols-3">
          {[
            {
              icon: <Snowflake className="h-5 w-5" />,
              label: 'Hosting & Infrastructure',
              desc: 'Covers server costs, domain registration, and CDN bandwidth for the wiki.',
            },
            {
              icon: <Heart className="h-5 w-5 text-frost-ember-400" />,
              label: 'Content & Research',
              desc: 'Rewards contributors who spend hours mapping zones, testing mechanics, and writing guides.',
            },
            {
              icon: <Crown className="h-5 w-5 text-frost-gold-400" />,
              label: 'New Features',
              desc: 'Funds tools like the Krono tracker, interactive maps, and upcoming class planners.',
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-frost-ice-600/50 bg-frost-ice-800/60 text-frost-rime-300">
                {item.icon}
              </span>
              <h4 className="font-serif text-sm font-semibold uppercase tracking-widest text-frost-steel-100">
                {item.label}
              </h4>
              <p className="font-sans text-sm leading-relaxed text-frost-steel-300">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Hall of Legends */}
        <div className="panel p-8 text-center">
          <div className="mb-6 flex items-center justify-center gap-2 text-frost-gold-300">
            <Crown className="h-5 w-5" />
            <h3 className="font-serif text-sm font-semibold uppercase tracking-widest">
              Hall of Legends
            </h3>
            <Crown className="h-5 w-5" />
          </div>
          <p className="mx-auto mb-8 max-w-lg font-sans text-sm text-frost-steel-300">
            These adventurers stand above the rest. Their patronage keeps the lights on across
            all of Norrath. All hail the Legends.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {legends.map((name) => (
              <span
                key={name}
                className="chip border-frost-gold-400/50 bg-frost-gold-400/10 text-frost-gold-300"
              >
                <Crown className="h-3 w-3" />
                {name}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <a
              href={PATREON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ice inline-flex"
            >
              <Heart className="h-4 w-4" />
              Support on Patreon
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
