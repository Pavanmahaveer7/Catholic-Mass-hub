export type Prayer = {
  id: string;
  title: string;
  titleEs?: string;
  text: string;
  textEs?: string;
};

export const prayers: Prayer[] = [
  {
    id: "our-father",
    title: "Our Father",
    titleEs: "Padre Nuestro",
    text: `Our Father, who art in heaven,
hallowed be Thy name;
Thy kingdom come;
Thy will be done on earth as it is in heaven.
Give us this day our daily bread;
and forgive us our trespasses
as we forgive those who trespass against us;
and lead us not into temptation,
but deliver us from evil. Amen.`,
    textEs: `Padre nuestro, que estás en el cielo,
santificado sea tu Nombre;
venga a nosotros tu reino;
hágase tu voluntad en la tierra como en el cielo.
Danos hoy nuestro pan de cada día;
perdona nuestras ofensas,
como también nosotros perdonamos a los que nos ofenden;
no nos dejes caer en la tentación,
y líbranos del mal. Amén.`,
  },
  {
    id: "hail-mary",
    title: "Hail Mary",
    titleEs: "Ave María",
    text: `Hail Mary, full of grace, the Lord is with thee;
blessed art thou among women,
and blessed is the fruit of thy womb, Jesus.
Holy Mary, Mother of God,
pray for us sinners,
now and at the hour of our death. Amen.`,
    textEs: `Dios te salve, María, llena eres de gracia;
el Señor es contigo.
Bendita tú eres entre todas las mujeres,
y bendito es el fruto de tu vientre, Jesús.
Santa María, Madre de Dios,
ruega por nosotros, pecadores,
ahora y en la hora de nuestra muerte. Amén.`,
  },
  {
    id: "glory-be",
    title: "Glory Be",
    titleEs: "Gloria",
    text: `Glory be to the Father, and to the Son, and to the Holy Spirit.
As it was in the beginning, is now, and ever shall be,
world without end. Amen.`,
    textEs: `Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre,
por los siglos de los siglos. Amén.`,
  },
  {
    id: "act-of-contrition",
    title: "Act of Contrition",
    titleEs: "Acto de Contrición",
    text: `O my God, I am heartily sorry for having offended Thee,
and I detest all my sins because of Thy just punishments,
but most of all because they offend Thee, my God,
who art all good and deserving of all my love.
I firmly resolve, with the help of Thy grace,
to sin no more and to avoid the near occasions of sin. Amen.`,
    textEs: `Dios mío, me arrepiento de todo corazón de haberte ofendido,
y detesto todos mis pecados porque te ofenden a ti,
que eres bondad infinita y digno de ser amado sobre todas las cosas.
Propongo firmemente, con tu gracia, no volver a pecar
y evitar las ocasiones próximas de pecado. Amén.`,
  },
  {
    id: "angelus",
    title: "The Angelus",
    titleEs: "El Ángelus",
    text: `V. The Angel of the Lord declared unto Mary.
R. And she conceived of the Holy Spirit.
Hail Mary…

V. Behold the handmaid of the Lord.
R. Be it done unto me according to thy word.
Hail Mary…

V. And the Word was made flesh.
R. And dwelt among us.
Hail Mary…

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.

Pour forth, we beseech Thee, O Lord, Thy grace into our hearts,
that we to whom the Incarnation of Christ Thy Son was made known
by the message of an angel, may by His Passion and Cross
be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen.`,
  },
];
