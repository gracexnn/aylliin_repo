import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Helper function to generate booking codes
function generateBookingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function main() {
  console.log('🌍 Starting mock data seeding...\n');

  // ─── Clean existing data (optional - comment out if you want to keep existing data) ────
  console.log('🧹 Cleaning existing data...');
  await prisma.traveler.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.departureSession.deleteMany();
  await prisma.postHighlight.deleteMany();
  await prisma.postInclusion.deleteMany();
  await prisma.routePoint.deleteMany();
  await prisma.route.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.libraryLocation.deleteMany();
  await prisma.libraryHighlight.deleteMany();
  await prisma.libraryInclusion.deleteMany();
  await prisma.siteVisit.deleteMany();
  console.log('✓ Cleaned existing data\n');

  // ─── Content Library ────────────────────────────────────────────────────────
  console.log('📚 Creating content library...');

  // Library Inclusions
  const inclusions = await Promise.all([
    prisma.libraryInclusion.create({
      data: {
        title: 'Мэргэжлийн хөтөч',
        description: 'Аяллын турш туршлагатай хөтөч дагалдана',
        icon: 'FaUserCheck',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Байр, байрлах үйлчилгээ',
        description: 'Тав тухтай зочид буудал болон уламжлалт гэр кемп',
        icon: 'FaHotel',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Өдөр бүрийн хоол',
        description: 'Өглөөний цай, өдрийн хоол, оройн хоол',
        icon: 'FaUtensils',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Хувийн тээвэр',
        description: 'Туршлагатай жолоочтой тав тухтай унаа',
        icon: 'FaCar',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Орох тасалбар',
        description: 'Үзмэр, үндэсний парк, хамгаалалтын бүсийн тасалбар',
        icon: 'FaTicket',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Аяллын даатгал',
        description: 'Илүү өргөн хүрээтэй аяллын даатгал',
        icon: 'FaShieldHalved',
        active: true,
      },
    }),
    prisma.libraryInclusion.create({
      data: {
        title: 'Нисэх буудлын трансфер',
        description: 'Нисэх буудлаас тосох, хүргэх үйлчилгээ',
        icon: 'FaPlaneArrival',
        active: true,
      },
    }),
  ]);

  // Library Highlights
  const highlights = await Promise.all([
    prisma.libraryHighlight.create({
      data: {
        title: 'Жижиг бүлгийн аялал',
        description: 'Дээд тал нь 12 хүнтэй — илүү анхааралтай үйлчилгээ',
        active: true,
      },
    }),
    prisma.libraryHighlight.create({
      data: {
        title: 'Соёлын жинхэнэ туршлага',
        description: 'Нүүдэлчин айлд зочилж, уламжлалт амьдралтай танилцана',
        active: true,
      },
    }),
    prisma.libraryHighlight.create({
      data: {
        title: 'Байгалийн гайхамшигт үзэмж',
        description: 'Цөлөөс уул хүртэлх онгон байгальтай танилцана',
        active: true,
      },
    }),
    prisma.libraryHighlight.create({
      data: {
        title: 'Зэрлэг амьтны ажиглалт',
        description: 'Ховор, хамгаалагдсан зүйлсийг харах боломж',
        active: true,
      },
    }),
    prisma.libraryHighlight.create({
      data: {
        title: 'Туршлагатай нутгийн хөтөч',
        description: 'Олон жилийн туршлагатай, мэдлэгтэй хөтөч',
        active: true,
      },
    }),
    prisma.libraryHighlight.create({
      data: {
        title: 'Уян хатан хөтөлбөр',
        description: 'Таны сонирхолд нийцүүлэн зохицуулах боломжтой',
        active: true,
      },
    }),
  ]);

  // Library Locations
  const locations = await Promise.all([
    prisma.libraryLocation.create({
      data: {
        name: 'Говь цөл',
        slug: 'gobi-desert',
        short_description: 'Элсэн манхан, хавцал, өвөрмөц амьтан бүхий уудам цөл',
        description: 'Говь цөл нь Монголын өмнөд хэсгийг хамарсан дэлхийн томоохон цөлүүдийн нэг. Элсэн манхан, хадат уулс, ховор амьтан (хоёр бөхт тэмээ гэх мэт) бүхий төрөл бүрийн тогтоцтой.',
        latitude: 43.5,
        longitude: 103.5,
        cover_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
          'https://images.unsplash.com/photo-1563784462041-5f1d7b0d8e2f?w=800',
        ],
        region: 'Өмнөд бүс',
        country: 'Монгол',
        tags: ['цөл', 'байгаль', 'амьтан', 'адал явдал'],
        active: true,
      },
    }),
    prisma.libraryLocation.create({
      data: {
        name: 'Хөвсгөл нуур',
        slug: 'khuvsgul-lake',
        short_description: 'Монголын “Хөх сувд” — уулсаар хүрээлэгдсэн онгон нуур',
        description: 'Хөвсгөл нуур нь Монголын хамгийн том цэнгэг нуур бөгөөд дэлхийн хамгийн цэвэр тунгалаг нууруудын нэг. Уул, тайгаар хүрээлэгдсэн бөгөөд цаа буга малладаг нүүдэлчдийн нутаг.',
        latitude: 51.0,
        longitude: 100.5,
        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        gallery: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        ],
        region: 'Хойд бүс',
        country: 'Монгол',
        tags: ['нуур', 'байгаль', 'уул', 'явган аялал'],
        active: true,
      },
    }),
    prisma.libraryLocation.create({
      data: {
        name: 'Улаанбаатар',
        slug: 'ulaanbaatar',
        short_description: 'Уламжлал ба орчин үе хосолсон нийслэл хот',
        description: 'Монголын нийслэл, хамгийн том хот. Орчин үеийн барилгуудын хажууд уламжлалт хийдүүд сүндэрлэнэ. Ихэнх аяллын эхлэл цэг.',
        latitude: 47.8864,
        longitude: 106.9057,
        cover_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        gallery: [],
        region: 'Төв бүс',
        country: 'Монгол',
        tags: ['хот', 'соёл', 'түүх', 'музей'],
        active: true,
      },
    }),
    prisma.libraryLocation.create({
      data: {
        name: 'Тэрэлжийн байгалийн цогцолборт газар',
        slug: 'terelj-national-park',
        short_description: 'Хад чулуу, нуга хөндий, нүүдэлчдийн соёл',
        description: 'Улаанбаатараас ердөө 80км орчим зайтай Тэрэлж нь боржин хадны тогтоц, цэнгэг гол горхи, үзэсгэлэнт байгаль, нүүдэлчин айлуудаараа алдартай.',
        latitude: 47.9833,
        longitude: 107.4333,
        cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        gallery: [],
        region: 'Төв бүс',
        country: 'Монгол',
        tags: ['байгалийн цогцолборт газар', 'байгаль', 'алхалт', 'нүүдэлчин соёл'],
        active: true,
      },
    }),
    prisma.libraryLocation.create({
      data: {
        name: 'Эрдэнэ Зуу хийд',
        slug: 'erdene-zuu-monastery',
        short_description: '1585 онд байгуулагдсан Монголын хамгийн эртний хийдийн нэг',
        description: 'Эртний нийслэл Хар хорумын туурин дээр байгуулагдсан энэхүү хийд нь Монголын хамгийн чухал шашин, түүхийн дурсгалуудын нэг бөгөөд онцгой архитектур, түүхэн үнэ цэнтэй.',
        latitude: 47.2167,
        longitude: 102.8333,
        cover_image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
        gallery: [],
        region: 'Төв бүс',
        country: 'Монгол',
        tags: ['хийд', 'шашин', 'түүх', 'соёл'],
        active: true,
      },
    }),
    prisma.libraryLocation.create({
      data: {
        name: 'Хонгорын элс',
        slug: 'khongoryn-els',
        short_description: '300м хүртэл өндөр “дуулдаг” элсэн манхан',
        description: 'Монголын хамгийн том элсэн манхан бөгөөд 180км үргэлжилнэ. Салхи элсийг хөдөлгөхөд “дуулдаг” мэт авиа гаргадаг гэдгээрээ алдартай.',
        latitude: 43.7333,
        longitude: 102.5167,
        cover_image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
        gallery: [],
        region: 'Өмнөд бүс',
        country: 'Монгол',
        tags: ['цөл', 'элсэн манхан', 'байгаль', 'адал явдал'],
        active: true,
      },
    }),
  ]);

  console.log(`✓ Created ${inclusions.length} inclusions`);
  console.log(`✓ Created ${highlights.length} highlights`);
  console.log(`✓ Created ${locations.length} locations\n`);

  // ─── Travel Guide Posts ─────────────────────────────────────────────────────
  console.log('✈️ Creating travel guide posts...');

  // Post 1: Turkey Riviera and Istanbul Journey
  const post1 = await prisma.post.create({
    data: {
      title: 'Турк улсын аялал – 8 өдөр / 7 шөнө',
      slug: 'turkey-antalya-pamukkale-istanbul',
      cover_image: 'https://hogiinsaw.wenly.space/covers/pexels-smuldur-2048865.jpg',
      excerpt: 'Анталья, Памуккале, Истанбулыг хамарсан далайн амралт + түүх, соёлын хосолсон аялал.',
      journey_overview: 'Улаанбаатар хотоос Турк руу нисэж, Антальягийн эрэг, Памуккалегийн хөвөн цайз, Истанбулын түүхэн дурсгал, Босфорын усан аяллыг нэг хөтөлбөрөөр үзнэ.',
      content: `<h2>Аяллын танилцуулга</h2>
<p>Энэ аялал нь Туркийн аялал жуулчлалын хамгийн алдартай 3 чиглэлийг нэгтгэсэн багц юм. Антальягийн эргийн амралтаас эхлээд Памуккалегийн өвөрмөц шохойн тогтоц, Истанбулын түүхэн төв хүртэл жинхэнэ олон өнгийн туршлага танд өгнө.</p>

<h2>Онцлох туршлага</h2>
<p>Антальяд амарч, Памуккале болон Хиераполисын бүсээр аялж, Истанбул хотын гол дурсгалуудтай танилцан Босфорын хоолойгоор усан завины аялал хийнэ.</p>

<h2>Яагаад энэ багцыг сонгох вэ?</h2>
<p>Бүх гол үзвэрүүдийг багтаасан, нислэг, буудал, орон нутгийн тээвэр, хөтөчтэй зохион байгуулалттай тул анх удаа Турк руу явах аялагчдад нэн тохиромжтой.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: '5* зочид буудлын стандарт ангилал, 2 хүн нэг өрөө',
          price: 4490000,
          currency: 'MNT',
        },
        {
          id: 'premium',
          title: 'Премиум багц',
          description: 'Сайжруулсан 5* буудал, илүү тав тухтай байрлалт',
          price: 5490000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Улаанбаатар – Анталья',
          description: 'Өглөө Улаанбаатараас нисэж Истанбулаар дамжин Антальяд хүрнэ. Буудалдаа бүртгүүлж амарна.',
          meals: ['Онгоцны хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Анталья хотын аялал',
          description: 'Антальягийн төв болон эргийн бүсээр аялж, түүхэн дурсгал ба чөлөөт цагийн хөтөлбөртэй өдөр өнгөрүүлнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 3,
          title: 'Анталья чөлөөт өдөр',
          description: 'Далайн эрэг, зочид буудлын үйлчилгээ, хувийн сонирхлын аялал эсвэл амралтын өдөр.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Усан спорт', 'Шоппинг'],
        },
        {
          day_number: 4,
          title: 'Анталья – Памуккале (~273км)',
          description: 'Автобусаар Памуккале руу хөдөлж буудалдаа байрлана. Орой халуун рашаан, амралтын цаг.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 5,
          title: 'Памуккале – Хиераполис – Истанбул',
          description: 'Памуккале, Хиераполисын дурсгалт газруудаар аялсны дараа Истанбул руу дотоодын нислэг хийнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 6,
          title: 'Истанбул хот + Босфорын хоолой',
          description: 'Истанбулын түүхэн дурсгалт бүс, сүм хийд, музей, захуудаар аялж Босфорын усан аялал хийнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Босфорын оройн аялал'],
        },
        {
          day_number: 7,
          title: 'Истанбул чөлөөт өдөр',
          description: 'Чөлөөт өдөр: Гранд базар, худалдааны төвүүд, хоолны аялал эсвэл нэмэлт хөтөлбөр сонгох боломжтой.',
          meals: ['Өглөөний цай'],
          optional_extras: ['Гранд базар', 'Нэмэлт музейн тасалбар'],
        },
        {
          day_number: 8,
          title: 'Истанбул – Улаанбаатар',
          description: 'Өглөө/өдөр Истанбулаас буцах нислэгээр Улаанбаатарт ирж аялал өндөрлөнө.',
          meals: ['Өглөөний цай', 'Онгоцны хоол'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Гадаад паспортын хүчинтэй хугацаа 6+ сар байх шаардлагатай</li>
    <li>Эрэг орчимд дулаан, дотоод бүсэд сэрүүхэн тул давхар хувцас авч яваарай</li>
    <li>Түүхэн сүм, дурсгалт газарт зохих хувцаслалт хэрэгтэй</li>
    <li>Евро эсвэл картаар төлбөр хийхэд тохиромжтой</li>
    <li>Олон алхалттай тул эвтэйхэн гутал заавал бэлдэнэ</li>
</ul>`,
      published: true,
      highlighted: true,
    },
  });

  // Post 2: Japan Express Discovery
  const post2 = await prisma.post.create({
    data: {
      title: 'Япон аялал – 5 өдөр / 4 шөнө',
      slug: 'japan-tokyo-fuji-5d4n',
      cover_image: 'https://hogiinsaw.wenly.space/covers/pexels-dylan-chan-2880813-4410426.jpg',
      excerpt: 'Токио хот, Фүжи уул, Ширайто хүрхрээ, Овакүдани бүсийг багтаасан богино хугацааны Япон аялал.',
      journey_overview: 'Улаанбаатар–Нарита шууд нислэгтэй, Токио хотын гол үзвэрүүд болон Фүжи орчмын байгалийн чиглэлүүдийг хамарсан 5 өдрийн цогц хөтөлбөр.',
      content: `<h2>Япон руу богино хугацааны хөтөлбөр</h2>
<p>Ажлын завсарлага болон богино амралтад тохирсон энэхүү аяллаар Токио хотын орчин үе ба уламжлалт соёлыг зэрэг мэдэрнэ.</p>

<h2>Гол үзэх газрууд</h2>
<p>Одайба, Сенсожи сүм, Накамисэ Дори, Шибуяа, Хачикогийн хөшөө, Фүжи уулын бүс, Ширайто хүрхрээ, Овакүдани зэрэг аялал жуулчлалын шилдэг цэгүүд.</p>

<h2>Тав тух, зохион байгуулалт</h2>
<p>Олон улсын нислэг, зочид буудал, орон нутгийн тээвэр, хөтөч тайлбарлагч, үндсэн хоолнууд багтсан тул аяллаа амар тайван төлөвлөх боломжтой.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: '3* буудал, үндсэн хөтөлбөр, 2 хүн нэг өрөө',
          price: 5490000,
          currency: 'MNT',
        },
        {
          id: 'comfort',
          title: 'Тав тухтай багц',
          description: 'Сакура/өндөр улирлын огноо, илүү уян хатан хуваарь',
          price: 5990000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Улаанбаатар – Нарита – Токио',
          description: 'Өглөө Улаанбаатараас Нарита нисэж, Токио хот руу шилжинэ. Шибуяа болон Хачикогийн хөшөө орчимтой танилцана.',
          meals: ['Онгоцны хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Токио хотын аялал',
          description: 'Сенсожи сүм, Накамисэ Дори, Тэнгэрийн мод (Tokyo Skytree) орчим, Одайба зэрэг үзвэрүүдээр аялна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 3,
          title: 'Токио – Ширайто хүрхрээ – Фүжи уул',
          description: 'Токио хотоос Фүжи орчим руу гарч Ширайто хүрхрээ, уулын бүсийн байгальтай танилцана.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Gotemba outlet'],
        },
        {
          day_number: 4,
          title: 'Фүжи – Овакүдани – Токио',
          description: 'Овакүдани идэвхтэй галт уулын бүсээр аялсны дараа Токио хот руу буцна. Үдээс хойш чөлөөт цагтай.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Чөлөөт шоппинг'],
        },
        {
          day_number: 5,
          title: 'Токио – Нарита – Улаанбаатар',
          description: 'Нарита нисэх буудлаас буцах нислэгээр Улаанбаатарт ирж аялал өндөрлөнө.',
          meals: ['Өглөөний цай', 'Онгоцны хоол'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Япон виз болон хилээр нэвтрэх бичиг баримтаа урьдчилан бэлдэнэ</li>
    <li>Өдөр тутам их алхах тул тухтай гутал хамгийн чухал</li>
    <li>Хот дотор картаар төлбөр хийх боломж өндөр</li>
    <li>Цагийн баримтлалыг сайн мөрдөөрэй</li>
    <li>Халаасны Wi-Fi эсвэл roaming багц төлөвлөж болно</li>
</ul>`,
      published: true,
      highlighted: true,
    },
  });

  // Post 3: Beijing + Universal Studios
  const post3 = await prisma.post.create({
    data: {
      title: 'Бээжин + Universal Studios – 5 өдөр / 4 шөнө',
      slug: 'beijing-universal-studios-5d4n',
      cover_image: 'https://hogiinsaw.wenly.space/covers/pexels-magda-ehlers-pexels-2846075.jpg',
      excerpt: 'Шууд нислэгтэй Бээжингийн аялал: Цагаан хэрэм, Universal Studios, Zoo & Aquarium, TeamLab.',
      journey_overview: 'Улаанбаатараас Бээжин рүү шууд нисэж, гэр бүл болон залуучуудад тохиромжтой хотын үзвэр, паркийн хосолсон багц хөтөлбөр.',
      content: `<h2>Гэр бүлд ээлтэй Бээжингийн багц</h2>
<p>5 өдөрт Бээжин хотын хамгийн их эрэлттэй үзвэрүүдийг багтаасан энэхүү хөтөлбөр нь хүүхэдтэй гэр бүл болон найзуудын аялалд тохиромжтой.</p>

<h2>Онцлох чиглэлүүд</h2>
<p>Цагаан хэрэм, Шувууны үүр, Universal Studios парк, Бээжингийн Zoo & Aquarium, TeamLab гэрлийн шоу зэрэг орчин үе ба түүхийн хослолыг үзнэ.</p>

<h2>Төлөвлөхөд хялбар</h2>
<p>Шууд нислэг, буудал, үндсэн үзвэрийн тасалбар, хөтөч, тээвэр багтсан тул анх удаа Бээжин рүү аялахад өндөр тохиромжтой.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: '4* буудал, 2 хүн нэг өрөө',
          price: 2690000,
          currency: 'MNT',
        },
        {
          id: 'premium',
          title: 'Премиум багц',
          description: 'Сайжруулсан байрлалт, өрөөний сонголт илүү уян хатан',
          price: 2990000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Улаанбаатар – Бээжин',
          description: 'Шууд нислэгээр Бээжинд хүрч, Цагаан хэрэм болон Шувууны үүрийн бүсийг үзсэний дараа буудалдаа байрлана.',
          meals: ['Онгоцны зууш', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Universal Studios бүтэн өдөр',
          description: 'Universal Studios Beijing-д бүтэн өдрийн хөтөлбөртэй, шоу болон сэдэвчилсэн бүсүүдээр аялна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['VIP Express pass'],
        },
        {
          day_number: 3,
          title: 'Бээжин хотын аялал (Zoo, Aquarium, TeamLab)',
          description: 'Бээжингийн амьтны хүрээлэн, аквариум, TeamLab гэрлийн шоу болон хотын гол үзвэрүүдээр аялна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 4,
          title: 'Чөлөөт өдөр',
          description: 'Чөлөөт өдөр: худалдааны төвүүд, гудамжны хоол, музей эсвэл өөрийн сонирхлоор нэмэлт аялал сонгох боломжтой.',
          meals: ['Өглөөний цай'],
          optional_extras: ['Шоппинг', 'Нэмэлт соёлын шоу'],
        },
        {
          day_number: 5,
          title: 'Бээжин – Улаанбаатар',
          description: 'Нисэх буудал руу хүргүүлэн буцах нислэгээр Улаанбаатарт ирж аялал өндөрлөнө.',
          meals: ['Өглөөний цай', 'Онгоцны хоол'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Хил нэвтрэх бичиг баримт, визийн нөхцөлийг урьдчилан шалгана</li>
    <li>Хот дотор алхалт ихтэй тул эвтэйхэн пүүз авч явна</li>
    <li>Хүүхэдтэй аялж буй бол паркийн өдрийг тусад нь төлөвлөхөд тохиромжтой</li>
    <li>WeChat/Alipay-д холбох картын боломжийг урьдчилан нягтлаарай</li>
</ul>`,
      published: true,
      highlighted: true,
    },
  });

  console.log(`✓ Created ${3} travel guide posts\n`);

  // ─── Post Images ────────────────────────────────────────────────────────────
  console.log('🖼️ Adding post images...');

  await prisma.postImage.createMany({
    data: [
      {
        post_id: post1.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%98%D1%81%D1%82%D0%B0%D0%BD%D0%B1%D1%83%D0%BB.jpg1_-300x200.jpg',
        alt: 'Истанбул хотын үзэмж',
      },
      {
        post_id: post1.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%BF%D0%B0%D0%BC%D0%B0%D0%BA%D1%83%D0%BB%D0%BB%D0%B5.jpg1_-300x200.jpg',
        alt: 'Памуккалегийн хөвөн цайз',
      },
      {
        post_id: post1.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%90%D0%BD%D1%82%D0%B0%D0%BB%D1%8C%D1%8F-300x200.jpg',
        alt: 'Антальягийн далайн эрэг',
      },
      {
        post_id: post2.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2021/06/xtokyo-150x150.jpg.pagespeed.ic.aq-lkOrfGv.webp',
        alt: 'Токио хот',
      },
      {
        post_id: post2.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2021/06/xMt.-Fuji-150x150.jpg.pagespeed.ic.XOcWNbr22i.webp',
        alt: 'Фүжи уул',
      },
      {
        post_id: post3.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2023/08/3-300x200.jpg',
        alt: 'Бээжин хотын үзэмж',
      },
      {
        post_id: post3.id,
        url: 'https://www.gazarchin.mn/wp-content/uploads/2023/08/4-300x200.jpg',
        alt: 'Universal Studios Beijing',
      },
    ],
  });

  console.log('✓ Added post images\n');

  // ─── Link Posts to Library Items ───────────────────────────────────────────
  console.log('🔗 Linking posts to library items...');

  // Post 1 inclusions
  await prisma.postInclusion.createMany({
    data: [
      { post_id: post1.id, inclusion_id: inclusions[0].id, order_index: 0, label_snapshot: inclusions[0].title },
      { post_id: post1.id, inclusion_id: inclusions[1].id, order_index: 1, label_snapshot: inclusions[1].title },
      { post_id: post1.id, inclusion_id: inclusions[2].id, order_index: 2, label_snapshot: inclusions[2].title },
      { post_id: post1.id, inclusion_id: inclusions[3].id, order_index: 3, label_snapshot: inclusions[3].title },
      { post_id: post1.id, inclusion_id: inclusions[4].id, order_index: 4, label_snapshot: inclusions[4].title },
      { post_id: post1.id, inclusion_id: inclusions[6].id, order_index: 5, label_snapshot: inclusions[6].title },
    ],
  });

  // Post 1 highlights
  await prisma.postHighlight.createMany({
    data: [
      { post_id: post1.id, highlight_id: highlights[0].id, order_index: 0, label_snapshot: highlights[0].title },
      { post_id: post1.id, highlight_id: highlights[2].id, order_index: 1, label_snapshot: highlights[2].title },
      { post_id: post1.id, highlight_id: highlights[3].id, order_index: 2, label_snapshot: highlights[3].title },
      { post_id: post1.id, highlight_id: highlights[4].id, order_index: 3, label_snapshot: highlights[4].title },
    ],
  });

  // Post 2 inclusions and highlights
  await prisma.postInclusion.createMany({
    data: [
      { post_id: post2.id, inclusion_id: inclusions[0].id, order_index: 0, label_snapshot: inclusions[0].title },
      { post_id: post2.id, inclusion_id: inclusions[1].id, order_index: 1, label_snapshot: inclusions[1].title },
      { post_id: post2.id, inclusion_id: inclusions[2].id, order_index: 2, label_snapshot: inclusions[2].title },
      { post_id: post2.id, inclusion_id: inclusions[3].id, order_index: 3, label_snapshot: inclusions[3].title },
      { post_id: post2.id, inclusion_id: inclusions[5].id, order_index: 4, label_snapshot: inclusions[5].title },
    ],
  });

  await prisma.postHighlight.createMany({
    data: [
      { post_id: post2.id, highlight_id: highlights[1].id, order_index: 0, label_snapshot: highlights[1].title },
      { post_id: post2.id, highlight_id: highlights[2].id, order_index: 1, label_snapshot: highlights[2].title },
      { post_id: post2.id, highlight_id: highlights[4].id, order_index: 2, label_snapshot: highlights[4].title },
    ],
  });

  // Post 3 inclusions and highlights
  await prisma.postInclusion.createMany({
    data: [
      { post_id: post3.id, inclusion_id: inclusions[0].id, order_index: 0, label_snapshot: inclusions[0].title },
      { post_id: post3.id, inclusion_id: inclusions[1].id, order_index: 1, label_snapshot: inclusions[1].title },
      { post_id: post3.id, inclusion_id: inclusions[2].id, order_index: 2, label_snapshot: inclusions[2].title },
      { post_id: post3.id, inclusion_id: inclusions[3].id, order_index: 3, label_snapshot: inclusions[3].title },
    ],
  });

  await prisma.postHighlight.createMany({
    data: [
      { post_id: post3.id, highlight_id: highlights[0].id, order_index: 0, label_snapshot: highlights[0].title },
      { post_id: post3.id, highlight_id: highlights[5].id, order_index: 1, label_snapshot: highlights[5].title },
    ],
  });

  console.log('✓ Linked posts to library items\n');

  // ─── Routes and Route Points ───────────────────────────────────────────────
  console.log('🗺️ Creating routes and waypoints...');

  // Route for Post 1 (Turkey)
  const route1 = await prisma.route.create({
    data: {
      post_id: post1.id,
      title: 'Турк: Анталья – Памуккале – Истанбул',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Аяллын эхлэл цэг',
            transport_type: 'PLANE',
            recommended_time_to_visit: 'Нислэг',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 36.8969,
            longitude: 30.7133,
            name: 'Анталья',
            description: 'Газар дундын тэнгисийн эргийн амралтын бүс',
            transport_type: 'PLANE',
            interesting_fact: 'Туркийн аялал жуулчлалын гол төвүүдийн нэг',
            recommended_time_to_visit: '3 өдөр',
            day_number: 2,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%90%D0%BD%D1%82%D0%B0%D0%BB%D1%8C%D1%8F-300x200.jpg'],
          },
          {
            order_index: 2,
            latitude: 37.9137,
            longitude: 29.1187,
            name: 'Памуккале',
            description: 'Хөвөн цайз шохойн тогтоц, Хиераполисын бүс',
            transport_type: 'DRIVING',
            interesting_fact: 'UNESCO-д бүртгэлтэй түүх, байгалийн цогц дурсгал',
            recommended_time_to_visit: '1 өдөр',
            day_number: 4,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%BF%D0%B0%D0%BC%D0%B0%D0%BA%D1%83%D0%BB%D0%BB%D0%B5.jpg1_-300x200.jpg'],
          },
          {
            order_index: 3,
            latitude: 41.0082,
            longitude: 28.9784,
            name: 'Истанбул',
            description: 'Европ, Азийг холбосон түүхэн их хот',
            transport_type: 'PLANE',
            interesting_fact: 'Босфорын хоолой хоёр тивийг заагладаг',
            recommended_time_to_visit: '3 өдөр',
            day_number: 6,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2021/10/%D0%98%D1%81%D1%82%D0%B0%D0%BD%D0%B1%D1%83%D0%BB.jpg1_-300x200.jpg'],
          },
          {
            order_index: 4,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар (буцах)',
            description: 'Аяллын төгсгөл',
            transport_type: 'PLANE',
            recommended_time_to_visit: 'Нислэг',
            day_number: 8,
            location_id: locations[2].id,
            images: [],
          },
        ],
      },
    },
  });

  // Route for Post 2 (Japan)
  const route2 = await prisma.route.create({
    data: {
      post_id: post2.id,
      title: 'Япон: Токио – Фүжи',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Шууд нислэгийн эхлэл',
            transport_type: 'PLANE',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 35.6762,
            longitude: 139.6503,
            name: 'Токио',
            description: 'Орчин үеийн болон уламжлалт соёлыг хослуулсан мегаполис хот',
            transport_type: 'PLANE',
            interesting_fact: 'Дэлхийн хамгийн том метрополитен бүсийн нэг',
            recommended_time_to_visit: '3 өдөр',
            day_number: 2,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2021/06/xtokyo-150x150.jpg.pagespeed.ic.aq-lkOrfGv.webp'],
          },
          {
            order_index: 2,
            latitude: 35.3606,
            longitude: 138.7274,
            name: 'Фүжи уулын бүс',
            description: 'Ширайто хүрхрээ, уулын байгалийн маршрут',
            transport_type: 'DRIVING',
            interesting_fact: 'Фүжи нь Японы хамгийн өндөр оргил (3776м)',
            recommended_time_to_visit: '2 өдөр',
            day_number: 3,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2021/06/xMt.-Fuji-150x150.jpg.pagespeed.ic.XOcWNbr22i.webp'],
          },
          {
            order_index: 3,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар (буцах)',
            description: 'Аяллын төгсгөл',
            transport_type: 'PLANE',
            day_number: 5,
            location_id: locations[2].id,
            images: [],
          },
        ],
      },
    },
  });

  // Route for Post 3 (Beijing)
  const route3 = await prisma.route.create({
    data: {
      post_id: post3.id,
      title: 'Бээжин: Хот + Universal Studios',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Шууд нислэгийн эхлэл',
            transport_type: 'PLANE',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 39.9042,
            longitude: 116.4074,
            name: 'Бээжин',
            description: 'Хятадын нийслэл, түүх соёлын төв',
            transport_type: 'PLANE',
            recommended_time_to_visit: '5 өдөр',
            day_number: 1,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2023/08/x3-150x150.jpg.pagespeed.ic.6FqYbEsagm.webp'],
          },
          {
            order_index: 2,
            latitude: 39.8905,
            longitude: 116.7036,
            name: 'Universal Studios Beijing',
            description: 'Сэдэвчилсэн парк, шоу болон тоглоомын бүсүүд',
            transport_type: 'DRIVING',
            interesting_fact: 'Азийн томоохон студи паркуудын нэг',
            recommended_time_to_visit: 'Бүтэн өдөр',
            day_number: 2,
            images: ['https://www.gazarchin.mn/wp-content/uploads/2023/08/x4-150x150.jpg.pagespeed.ic.QYMek98owY.webp'],
          },
          {
            order_index: 3,
            latitude: 40.4319,
            longitude: 116.5704,
            name: 'Цагаан хэрэм',
            description: 'Дэлхийн долоон гайхамшгийн нэг',
            transport_type: 'DRIVING',
            recommended_time_to_visit: 'Хагас өдөр',
            day_number: 3,
            images: [],
          },
          {
            order_index: 4,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар (буцах)',
            description: 'Аяллын төгсгөл',
            transport_type: 'PLANE',
            day_number: 5,
            location_id: locations[2].id,
            images: [],
          },
        ],
      },
    },
  });

  console.log('✓ Created routes with waypoints\n');

  // ─── Departure Sessions ────────────────────────────────────────────────────
  console.log('📅 Creating departure sessions...');

  const sessions = [];

  // Sessions for Post 1 (Turkey)
  for (let i = 0; i < 6; i++) {
    const departureDate = new Date(2026, 2 + i, i % 2 === 0 ? 5 : 21); // March through August, bi-weekly style
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 8);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post1.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Турк – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 4490000,
          currency: 'MNT',
          discount_type: i % 3 === 0 ? 'PERCENT' : null,
          discount_value: i % 3 === 0 ? 5 : null,
          discount_reason: i % 3 === 0 ? 'Эрт захиалгын хөнгөлөлт' : null,
          final_price: i % 3 === 0 ? 4265500 : 4490000,
          capacity: 24,
          seats_booked: i < 3 ? Math.floor(Math.random() * 18) : 0,
          status: i < 4 ? 'OPEN' : 'DRAFT',
          public_note: 'Эрт захиалгын урамшуулал үйлчилнэ',
        },
      })
    );
  }

  // Sessions for Post 2 (Japan)
  for (let i = 0; i < 4; i++) {
    const departureDate = new Date(2026, 2 + i, [27, 5, 22, 12][i]); // 3/27, 4/5, 5/22, 6/12
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 5);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post2.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Япон – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 5490000,
          currency: 'MNT',
          final_price: 5490000,
          capacity: 20,
          seats_booked: i === 0 ? 11 : 0,
          status: i < 3 ? 'OPEN' : 'DRAFT',
        },
      })
    );
  }

  // Sessions for Post 3 (Beijing)
  for (let i = 0; i < 8; i++) {
    const departureDate = new Date(2026, 2 + i, i % 2 === 0 ? 3 : 29); // March through October
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 5);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post3.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Бээжин – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 2690000,
          currency: 'MNT',
          discount_type: i % 3 === 0 ? 'FIXED' : null,
          discount_value: i % 3 === 0 ? 200000 : null,
          discount_reason: i % 3 === 0 ? 'Гэр бүлийн урамшуулал' : null,
          final_price: i % 3 === 0 ? 2490000 : 2690000,
          capacity: 25,
          seats_booked: i < 4 ? Math.floor(Math.random() * 16) : 0,
          status: i < 5 ? 'OPEN' : 'DRAFT',
        },
      })
    );
  }

  console.log(`✓ Created ${sessions.length} departure sessions\n`);

  // ─── Bookings with Travelers ───────────────────────────────────────────────
  console.log('📝 Creating sample bookings...');

  const bookings = [];

  // Booking 1: Confirmed booking
  const booking1 = await prisma.booking.create({
    data: {
      booking_code: generateBookingCode(),
      post_id: post1.id,
      departure_session_id: sessions[0].id,
      package_option_id: 'standard',
      contact_name: 'Саруул Бат',
      contact_phone: '+976-9911-2233',
      contact_email: 'saruul.bat@example.mn',
      passenger_count: 2,
      total_price_snapshot: 8980000,
      currency: 'MNT',
      booking_status: 'CONFIRMED',
      payment_status: 'PAID',
      source: 'website',
      travelers: {
        create: [
          {
            full_name: 'Саруул Бат',
            gender: 'Эмэгтэй',
            date_of_birth: new Date('1988-05-15'),
            passport_number: 'MN1234567',
            nationality: 'Монгол',
            phone: '+976-9911-2233',
            email: 'saruul.bat@example.mn',
          },
          {
            full_name: 'Тэмүүлэн Бат',
            gender: 'Эрэгтэй',
            date_of_birth: new Date('1985-08-22'),
            passport_number: 'MN7654321',
            nationality: 'Монгол',
            phone: '+976-9911-2244',
            email: 'temuulen.bat@example.mn',
          },
        ],
      },
    },
  });

  // Booking 2: Pending booking
  const booking2 = await prisma.booking.create({
    data: {
      booking_code: generateBookingCode(),
      post_id: post2.id,
      departure_session_id: sessions[6].id,
      package_option_id: 'comfort',
      contact_name: 'Энхжин Сүх',
      contact_phone: '+976-8811-4455',
      contact_email: 'enkhjin.sukh@example.mn',
      passenger_count: 1,
      total_price_snapshot: 5990000,
      currency: 'MNT',
      booking_status: 'PENDING',
      payment_status: 'PARTIAL',
      source: 'website',
      admin_note: 'Паспортын хуулбар хүлээж байна',
      travelers: {
        create: [
          {
            full_name: 'Энхжин Сүх',
            gender: 'Эмэгтэй',
            date_of_birth: new Date('1995-03-10'),
            nationality: 'Монгол',
            phone: '+976-8811-4455',
            email: 'enkhjin.sukh@example.mn',
          },
        ],
      },
    },
  });

  // Booking 3: Family booking
  const booking3 = await prisma.booking.create({
    data: {
      booking_code: generateBookingCode(),
      post_id: post3.id,
      departure_session_id: sessions[12].id,
      package_option_id: 'premium',
      contact_name: 'Бат-Эрдэнэ Ганболд',
      contact_phone: '+976-9900-1122',
      contact_email: 'baterdene.ganbold@example.mn',
      passenger_count: 4,
      total_price_snapshot: 11960000,
      currency: 'MNT',
      booking_status: 'CONFIRMED',
      payment_status: 'PAID',
      source: 'admin',
      travelers: {
        create: [
          {
            full_name: 'Бат-Эрдэнэ Ганболд',
            gender: 'Эрэгтэй',
            date_of_birth: new Date('1980-07-20'),
            passport_number: 'MN9988776',
            nationality: 'Монгол',
            phone: '+976-9900-1122',
            email: 'baterdene.ganbold@example.mn',
          },
          {
            full_name: 'Солонго Ганболд',
            gender: 'Эмэгтэй',
            date_of_birth: new Date('1982-11-15'),
            passport_number: 'MN1122334',
            nationality: 'Монгол',
          },
          {
            full_name: 'Номин Ганболд',
            gender: 'Эмэгтэй',
            date_of_birth: new Date('2010-04-05'),
            passport_number: 'MN5566778',
            nationality: 'Монгол',
            special_request: 'Цагаан хоол',
          },
          {
            full_name: 'Тэнүүн Ганболд',
            gender: 'Эрэгтэй',
            date_of_birth: new Date('2012-09-18'),
            passport_number: 'MN6677889',
            nationality: 'Монгол',
          },
        ],
      },
    },
  });

  console.log(`✓ Created ${3} bookings with travelers\n`);

  // ─── Site Visits (Analytics) ───────────────────────────────────────────────
  console.log('📊 Creating site visit analytics...');

  const paths = ['/', '/guides', `/guides/${post1.slug}`, `/guides/${post2.slug}`, `/guides/${post3.slug}`, '/about', '/contact'];
  const referrers = ['https://google.com', 'https://facebook.com', 'https://instagram.com', null];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  ];

  const visitData = [];
  for (let i = 0; i < 100; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() - daysAgo);

    visitData.push({
      id: randomUUID(),
      visitor_id: `visitor-${Math.floor(Math.random() * 50)}`,
      path: paths[Math.floor(Math.random() * paths.length)],
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      user_agent: userAgents[Math.floor(Math.random() * userAgents.length)],
      created_at: visitDate,
    });
  }

  await prisma.siteVisit.createMany({ data: visitData });

  console.log('✓ Created site visit analytics\n');

  // ─── Landing Page Settings ─────────────────────────────────────────────────
  console.log('🏠 Creating landing page settings...');

  await prisma.landingPageSettings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      hero_title: 'Монголын гайхамшгийг нээгээрэй',
      hero_subtitle: 'Мөнх хөх тэнгэрийн орны жинхэнэ адал явдал — Говь цөлөөс тайгын ой хүртэл',
      hero_primary_cta_text: 'Аяллуудаа үзэх',
      hero_primary_cta_url: '/guides',
      hero_secondary_cta_text: 'Холбоо барих',
      hero_secondary_cta_url: '/contact',
      contact_email: 'info@mongoliaaventures.com',
      contact_phone: '+976-11-123456',
      contact_address: 'Энхтайваны өргөн чөлөө 15, Улаанбаатар, Монгол',
      contact_whatsapp: '+976-99-123456',
      facebook_url: 'https://facebook.com/mongoliaadventures',
      instagram_url: 'https://instagram.com/mongoliaadventures',
      highlight_1_title: 'Туршлагатай хөтөч',
      highlight_1_description: 'Монголын соёл, байгалийн талаар гүн мэдлэгтэй хөтчүүд',
      highlight_2_title: 'Жижиг бүлэг',
      highlight_2_description: 'Нэг аялалд дээд тал нь 12 хүн — илүү чанартай үйлчилгээ',
      highlight_3_title: 'Тогтвортой аялал жуулчлал',
      highlight_3_description: 'Орон нутгийг дэмжиж, онгон байгалиа хамгаална',
      why_label: 'Яагаад бид гэж?',
      why_heading: 'Итгэлтэйгээр Монголыг мэдрээрэй',
      why_body: '15+ жилийн туршлагад тулгуурлан бид нутгийн соёлыг хүндэтгэж, байгаль орчноо хамгаалсан жинхэнэ аяллыг зохион байгуулдаг. Тогтвортой аялал жуулчлалын зарчим маань таны аялал Монголд бодит үр өгөөж авчрахад чиглэнэ.',
      announcement_text: '🎉 Хаврын урамшуулал: 5-р сарын 31-нээс өмнө захиалбал сонгосон аяллуудад 10% хямдрал!',
      footer_blurb: 'Mongolia Adventures Ltd. — 2010 оноос хойш мартагдашгүй аяллуудыг бүтээж байна',
      meta_title: 'Монголын аялал | Говь, Хөвсгөл, Нүүдэлчин соёл',
      meta_description: 'Монгол орны жинхэнэ аяллыг мэргэжлийн хөтөчтэйгээр мэдрээрэй. Говийн адал явдал, Хөвсгөлийн нуур, нүүдэлчдийн соёл — өнөөдөр захиалаарай!',
      og_image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
      updated_by: 'system',
    },
  });

  console.log('✓ Created landing page settings\n');

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('✨ Mock data seeding completed!\n');
  console.log('📋 Summary:');
  console.log(`   • ${inclusions.length} reusable inclusions`);
  console.log(`   • ${highlights.length} reusable highlights`);
  console.log(`   • ${locations.length} library locations`);
  console.log(`   • 3 published travel guides`);
  console.log(`   • 3 routes with detailed waypoints`);
  console.log(`   • ${sessions.length} departure sessions`);
  console.log(`   • 3 bookings with 7 travelers`);
  console.log(`   • 100 site visit records`);
  console.log(`   • Landing page configured`);
  console.log('\n🎉 Your travel platform is ready with realistic data!');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
