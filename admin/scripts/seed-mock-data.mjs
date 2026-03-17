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

  // Post 1: Classic Gobi Desert Adventure
  const post1 = await prisma.post.create({
    data: {
      title: 'Сонгодог Говийн адал явдал – 7 өдөр',
      slug: 'classic-gobi-desert-adventure',
      cover_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600',
      excerpt: 'Говийн уудам тал, элсэн манхан, нүүдэлчдийн ахуй, тэмээ унах, эртний хавцалтай танилцах 7 өдрийн мартагдашгүй аялал.',
      journey_overview: 'Монголын домогт Говьд аялан, гэр кемпэд бууж, онгон байгаль, ховор амьтдыг ажиглан, дэлхийн өвөрмөц цөлийн тогтоцуудаар аялна.',
      content: `<h2>Аяллын товч</h2>
<p>Дэлхийн хамгийн сонирхолтой бүсүүдийн нэг болох домогт Говь цөлөөр 7 өдрийн адал явдалтай аялалд гараарай. Энэ аялал таныг Монголын өмнөд гүн рүү хөтөлж, хязгааргүй уудам тал, өвөрмөц тогтоц, нүүдэлчдийн уламжлалтай танилцуулна.</p>

<h2>Юугаараа онцгой вэ?</h2>
<p>Говь бол өөр хаана ч байхгүй мэдрэмж. Салхинд “дуулдаг” Хонгорын элсэн манхан, үлэг гүрвэлийн олдвороороо алдартай Баянзаг ("Галууны хошуу") зэрэг гайхамшиг өдөр бүр таныг хүлээж байна. Та тав тухтай гэр кемпэд байрлаж, нүүдэлчдийн зочломтгой зан, байгалийн дуу чимээг мэдэрнэ.</p>

<h2>Өдөр бүрийн онцлох зүйлс</h2>
<p>Хөтөлбөрийг Говийн олон төрлийн өнгө төрхийг харуулах байдлаар төлөвлөсөн. Алтан элсэн дээгүүр хоёр бөхт тэмээгээр аялж, зуны улиралд ч мөстэй байдаг хавцлаар алхаж, нүүдэлчин айлд зочлон ахуй соёлтой танилцана.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: 'Тав тухтай гэр кемп, дундын тохижилт',
          price: 1890000,
          currency: 'MNT',
        },
        {
          id: 'comfort',
          title: 'Тав тухтай багц',
          description: 'Сайжруулсан гэр кемп, хувийн ариун цэвэр',
          price: 2490000,
          currency: 'MNT',
        },
        {
          id: 'premium',
          title: 'Премиум багц',
          description: 'Дээд зэрэглэлийн байр, хувийн хөтөч',
          price: 3290000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Улаанбаатарт ирэх',
          description: 'Нисэх буудлаас тосож авна. Хотын аялал (Гандан хийд, Үндэсний музей гэх мэт). Танилцах оройн зоог.',
          meals: ['Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Дунд Говь руу хөдөлнө',
          description: 'Говийн бүс рүү уудам тал нутгаар аялсаар хүрнэ. Нүүдэлчин айлд зочилж ахуй соёлтой танилцана. Гэр кемпэд байрлана.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 3,
          title: 'Хонгорын элс',
          description: '“Дуулдаг” элсэн манхантай танилцана. Тэмээ унах туршлага. Нар жаргах үеийн гэрэл зураг.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Тэмээ унах', 'Гэрэл зураг'],
        },
        {
          day_number: 4,
          title: 'Ёлын ам',
          description: 'Мөстэй хавцлаар алхана. Зэрлэг амьтан, шувууд ажиглана. Богино алхалт.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Зэрлэг амьтан ажиглалт'],
        },
        {
          day_number: 5,
          title: 'Баянзаг (Галууны хошуу)',
          description: 'Үлэг гүрвэлийн олдворын алдарт бүсээр аялна. Заг модны төгөлтэй танилцана. Оройн галын дэргэд амарна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Оройн түүдэг гал'],
        },
        {
          day_number: 6,
          title: 'Улаанбаатар руу буцах',
          description: 'Нийслэл рүү буцаж ирнэ. Дэлгүүр хэсэх чөлөөт цаг. Үдэлтийн оройн зоог (уламжлалт тоглолттой).',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Соёлын тоглолт'],
        },
        {
          day_number: 7,
          title: 'Буцах өдөр',
          description: 'Нисэх буудал руу хүргэж өгнө.',
          meals: ['Өглөөний цай'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Аялах хамгийн тохиромжтой үе: 5–9 сар</li>
    <li>Өдөр шөнө температур их хэлбэлздэг — давхар хувцас бэлдээрэй</li>
    <li>Нарны тос, нарны шил, малгай заавал авч яваарай</li>
    <li>Сайхан зураг авах камер/утас хэрэгтэй</li>
    <li>Алслагдсан газарт бэлэн мөнгө хэрэгтэй — АТМ ихэвчлэн Улаанбаатарт</li>
</ul>`,
      published: true,
      highlighted: true,
    },
  });

  // Post 2: Northern Mongolia Discovery
  const post2 = await prisma.post.create({
    data: {
      title: 'Хойд Монголын нээлт – 10 өдөр',
      slug: 'northern-mongolia-discovery',
      cover_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600',
      excerpt: 'Хөвсгөл нуурын тунгалаг ус, тайгын ой, цаатан (цаа буга маллагч) иргэдтэй уулзах Хойд Монголын онгон байгалийн аялал.',
      journey_overview: 'Хөвсгөл нуураас эхлээд цаа буга маллагчдын нутаг болох алслагдсан тайгын бүс хүртэлх Хойд Монголын гайхамшгийг нээнэ.',
      content: `<h2>Онгон байгалийн аялал</h2>
<p>Хойд Монгол бол дэлхийн онгон байгалийн үнэт бүсүүдийн нэг. Энэхүү 10 өдрийн аяллаар та цасархаг оргилууд усанд тусах тунгалаг нуур, хөвч тайгын өргөн уудам ой, эртний уламжлалаа хадгалсан цаа буга маллагчдын амьдралтай танилцана.</p>

<h2>Хөвсгөл нуур – Монголын хөх сувд</h2>
<p>“Монголын хөх сувд” хэмээн нэрлэгддэг Хөвсгөл нуур нь дэлхийн хамгийн цэвэр цэнгэг усны нөөцийн нэг. Уулсаар хүрээлэгдсэн энэ нуурын эрэгт амарч, завиар аялах, морь унах, байгальд тайвширч суух боломжтой.</p>

<h2>Цаатантай уулзах нь</h2>
<p>Аяллын хамгийн онцлох хэсэг бол тайгын алслагдсан бууцанд амьдрах цаатан (цаа бугын хүмүүс) нүүдэлчидтэй уулзах. Тэд цаа бугатайгаа онцгой харилцаатай амьдарч, олон зууны турш бараг өөрчлөгдөөгүй ахуйгаа хадгалсаар ирсэн.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: 'Гэр кемп + орон нутгийн буудлын хослол',
          price: 2890000,
          currency: 'MNT',
        },
        {
          id: 'comfort',
          title: 'Тав тухтай багц',
          description: 'Сайжруулсан байр, хувийн тээвэр',
          price: 3690000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Улаанбаатарт ирэх',
          description: 'Нисэх буудлаас тосож аваад буудалд байрлуулна. Хотын товч танилцах аялал.',
          meals: ['Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Мөрөн нисээд Хөвсгөл нуур руу явна',
          description: 'Дотоодын нислэгээр Мөрөн хүрээд, нуур руу авто аялал хийнэ. Үдээс хойш нуурын эргээр амарна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 3,
          title: 'Хөвсгөл нуурын өдөр',
          description: 'Нууранд бүтэн өдөр: завиар/каяакаар аялах, морь унах эсвэл алхалт. Орон нутгийн айлуудаар зочилно.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Каяак/завиар аялал', 'Морь унах'],
        },
        {
          day_number: 4,
          title: 'Тайга руу зорчих',
          description: 'Алслагдсан тайгын бүс рүү аяллаа эхлүүлнэ. Автомашин болон морьтой аяллын хэсэг багтана.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 5,
          title: 'Цаатан (цаа буга) малчид',
          description: 'Цаа буга маллагчдын хамт бүтэн өдөр. Ахуй соёлтой танилцаж, цаа буга унах, өдөр тутмын ажилд оролцоно.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Цаа буга унах', 'Соёлын туршлага'],
        },
        {
          day_number: 6,
          title: 'Тайгын судалгаа',
          description: 'Онгон тайгын ойгоор аялж, амьтан ажиглах, гэрэл зураг авах, байгалийн алхалт хийнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Зэрлэг амьтан ажиглалт'],
        },
        {
          day_number: 7,
          title: 'Нуур руу буцах',
          description: 'Хөвсгөл нуур руу буцаж ирнэ. Оройн түүдэг гал.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Оройн түүдэг гал'],
        },
        {
          day_number: 8,
          title: 'Мөрөн рүү буцах',
          description: 'Мөрөн хот руу явна. Орон нутгийн зах, музей үзнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 9,
          title: 'Улаанбаатар руу буцах',
          description: 'Дотоодын нислэгээр Улаанбаатар буцна. Дэлгүүр хэсэх чөлөөт цаг. Үдэлтийн оройн зоог.',
          meals: ['Өглөөний цай', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 10,
          title: 'Буцах өдөр',
          description: 'Нисэх буудал руу хүргэж өгнө.',
          meals: ['Өглөөний цай'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Хамгийн тохиромжтой үе: 6–9 сар</li>
    <li>Зун ч сэрүүхэн байдаг — дулаан хувцас заавал</li>
    <li>Дунд зэргийн ачаалалтай — биеийн бэлтгэлтэй байх нь зүгээр</li>
    <li>Алслагдсан газарт сүлжээ хязгаарлагдмал</li>
    <li>Тайгад шавьж үргээгч авч яваарай</li>
</ul>`,
      published: true,
      highlighted: true,
    },
  });

  // Post 3: Central Mongolia Explorer
  const post3 = await prisma.post.create({
    data: {
      title: 'Төв Монголын аялал – 5 өдөр',
      slug: 'central-mongolia-explorer',
      cover_image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1600',
      excerpt: 'Тэрэлж, түүхэн хийдүүд, нүүдэлчдийн ахуй соёлтой танилцах — Монголд анх удаа ирж буй хүмүүст тохиромжтой 5 өдрийн аялал.',
      journey_overview: 'Улаанбаатар хотын ойролцоох Төв бүсийн байгаль, түүх, соёлыг нэг дороос мэдрэх төгс танилцах аялал.',
      content: `<h2>Монголыг товчхон мэдрэх нь</h2>
<p>Энэхүү 5 өдрийн аялал нь Монголд анх удаа ирж буй эсвэл хугацаа багатай аялагчдад яг тохирно. Улаанбаатарын ойролцоох үзэсгэлэнт байгаль, буддын түүхэн өв, нүүдэлчдийн жинхэнэ соёлыг нэг дороос мэдрээрэй.</p>`,
      package_options: [
        {
          id: 'standard',
          title: 'Стандарт багц',
          description: 'Аяллын гэр кемп ба стандарт буудал',
          price: 1190000,
          currency: 'MNT',
        },
        {
          id: 'premium',
          title: 'Премиум багц',
          description: 'Дээд зэрэглэлийн байр, хувийн хөтөч',
          price: 1890000,
          currency: 'MNT',
        },
      ],
      itinerary_days: [
        {
          day_number: 1,
          title: 'Ирэх ба хотын аялал',
          description: 'Улаанбаатар хоттой танилцах аялал: Гандан хийд, Үндэсний музей, Сүхбаатарын талбай зэрэг.',
          meals: ['Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 2,
          title: 'Тэрэлж',
          description: 'Тэрэлж рүү явна. Хаданд авиралт/алхалт, морь унах, нүүдэлчин айлд зочилно.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Морь унах'],
        },
        {
          day_number: 3,
          title: 'Хархорин',
          description: 'Эртний нийслэл Хархорин руу явна. Эрдэнэ Зуу хийд болон Хархорин музей үзнэ.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: [],
        },
        {
          day_number: 4,
          title: 'Хустайгаар дайран буцах',
          description: 'Хустайн байгалийн цогцолборт газраар дайран тахь ажиглана. Дараа нь Улаанбаатар руу буцна.',
          meals: ['Өглөөний цай', 'Өдрийн хоол', 'Оройн хоол'],
          optional_extras: ['Тахь ажиглалт'],
        },
        {
          day_number: 5,
          title: 'Буцах өдөр',
          description: 'Сүүлчийн худалдан авалт хийх чөлөөт цаг. Нисэх буудал руу хүргэж өгнө.',
          meals: ['Өглөөний цай'],
          optional_extras: [],
        },
      ],
      travel_tips: `<ul>
    <li>Жилийн дөрвөн улиралд боломжтой ч 5–9 сар хамгийн тохиромжтой</li>
    <li>Бүх насныханд, ямар ч биеийн тамирын түвшинд тохиромжтой</li>
    <li>Хүүхэдтэй гэр бүлд маш тохиромжтой</li>
</ul>`,
      published: true,
      highlighted: false,
    },
  });

  console.log(`✓ Created ${3} travel guide posts\n`);

  // ─── Post Images ────────────────────────────────────────────────────────────
  console.log('🖼️ Adding post images...');

  await prisma.postImage.createMany({
    data: [
      {
        post_id: post1.id,
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
        alt: 'Говийн цөлийн үзэмж',
      },
      {
        post_id: post1.id,
        url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
        alt: 'Нар жаргах үеийн элсэн манхан',
      },
      {
        post_id: post1.id,
        url: 'https://images.unsplash.com/photo-1563784462041-5f1d7b0d8e2f?w=1200',
        alt: 'Говийн хоёр бөхт тэмээ',
      },
      {
        post_id: post2.id,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        alt: 'Хөвсгөл нуурын панорама',
      },
      {
        post_id: post2.id,
        url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200',
        alt: 'Уулын үзэмж',
      },
      {
        post_id: post3.id,
        url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
        alt: 'Буддын хийд',
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

  // Route for Post 1 (Gobi Desert)
  const route1 = await prisma.route.create({
    data: {
      post_id: post1.id,
      title: 'Говийн тойрог маршрут',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Эхлэл цэг — Монголын нийслэл хот',
            transport_type: 'DRIVING',
            recommended_time_to_visit: '1 өдөр',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 45.5,
            longitude: 104.5,
            name: 'Дунд Говь',
            description: 'Говийн байгалийн анхны мэдрэмж',
            transport_type: 'DRIVING',
            interesting_fact: 'Говь нь дэлхийн хамгийн том цөлүүдийн нэг',
            recommended_time_to_visit: '1 өдөр',
            day_number: 2,
            images: [],
          },
          {
            order_index: 2,
            latitude: 43.7333,
            longitude: 102.5167,
            name: 'Хонгорын элс',
            description: '180км үргэлжлэх асар том “дуулдаг” элсэн манхан',
            transport_type: 'DRIVING',
            interesting_fact: 'Элсний өндөр 300м хүрч, салхинд “дуулдаг” мэт авиа гардаг',
            recommended_time_to_visit: '1 өдөр',
            day_number: 3,
            location_id: locations[5].id,
            images: ['https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800'],
          },
          {
            order_index: 3,
            latitude: 43.5,
            longitude: 104.0,
            name: 'Ёлын ам (Бүргэдийн хөндий)',
            description: 'Зуны улиралд ч мөстэй байдаг нарийн хавцал',
            transport_type: 'DRIVING',
            interesting_fact: 'Хавцлын гүн сүүдэрлэг хэсэгт жилийн турш мөс байдаг',
            recommended_time_to_visit: 'Хагас өдөр',
            day_number: 4,
            images: [],
          },
          {
            order_index: 4,
            latitude: 44.1333,
            longitude: 103.8333,
            name: 'Баянзаг (Галууны хошуу)',
            description: 'Үлэг гүрвэлийн олдвороороо алдартай газар',
            transport_type: 'DRIVING',
            interesting_fact: '1923 онд дэлхийн анхны үлэг гүрвэлийн өндөг эндээс олдсон',
            recommended_time_to_visit: 'Хагас өдөр',
            day_number: 5,
            images: [],
          },
          {
            order_index: 5,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар руу буцах',
            description: 'Нийслэл рүү буцах зам',
            transport_type: 'DRIVING',
            recommended_time_to_visit: '1 өдөр',
            day_number: 6,
            location_id: locations[2].id,
            images: [],
          },
        ],
      },
    },
  });

  // Route for Post 2 (Northern Mongolia)
  const route2 = await prisma.route.create({
    data: {
      post_id: post2.id,
      title: 'Хойд Монголын маршрут',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Нийслэлээс хөдөлнө',
            transport_type: 'PLANE',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 51.0,
            longitude: 100.5,
            name: 'Хөвсгөл нуур',
            description: 'Монголын тунгалаг уулын нуур',
            transport_type: 'DRIVING',
            interesting_fact: 'Дэлхийн цэнгэг усны нөөцийн томоохон хэсэг энд хадгалагддаг гэж үздэг',
            recommended_time_to_visit: '3 өдөр',
            day_number: 2,
            location_id: locations[1].id,
            images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
          },
          {
            order_index: 2,
            latitude: 51.5,
            longitude: 99.5,
            name: 'Цаатны тайгын бууц',
            description: 'Цаа буга маллагчдын алслагдсан бууц',
            transport_type: 'DRIVING',
            interesting_fact: 'Цаатан нь цаа буга маллах соёлоо хадгалсан ховор нүүдэлчин бүлгүүдийн нэг',
            recommended_time_to_visit: '3 өдөр',
            day_number: 4,
            images: [],
          },
        ],
      },
    },
  });

  // Route for Post 3 (Central Mongolia)
  const route3 = await prisma.route.create({
    data: {
      post_id: post3.id,
      title: 'Төв Монголын тойрог маршрут',
      points: {
        create: [
          {
            order_index: 0,
            latitude: 47.8864,
            longitude: 106.9057,
            name: 'Улаанбаатар',
            description: 'Нийслэлээс эхэлнэ',
            transport_type: 'WALKING',
            day_number: 1,
            location_id: locations[2].id,
            images: [],
          },
          {
            order_index: 1,
            latitude: 47.9833,
            longitude: 107.4333,
            name: 'Тэрэлж',
            description: 'Уулын үзэмж, хад чулуун тогтоц',
            transport_type: 'DRIVING',
            recommended_time_to_visit: '1 өдөр',
            day_number: 2,
            location_id: locations[3].id,
            images: [],
          },
          {
            order_index: 2,
            latitude: 47.2167,
            longitude: 102.8333,
            name: 'Эрдэнэ Зуу хийд',
            description: 'Монголын эртний хийдийн нэг',
            transport_type: 'DRIVING',
            interesting_fact: 'Эртний нийслэл Хар хорумын туурин дээр байгуулагдсан',
            recommended_time_to_visit: 'Хагас өдөр',
            day_number: 3,
            location_id: locations[4].id,
            images: [],
          },
          {
            order_index: 3,
            latitude: 47.7,
            longitude: 105.3,
            name: 'Хустайн байгалийн цогцолборт газар',
            description: 'Тахь (Пржевальскийн адуу) нутагшсан газар',
            transport_type: 'DRIVING',
            interesting_fact: 'Тахь адууг дахин нутагшуулж амжилттай хамгаалж буй бүс',
            recommended_time_to_visit: 'Хагас өдөр',
            day_number: 4,
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

  // Sessions for Post 1 (Gobi Desert)
  for (let i = 0; i < 6; i++) {
    const departureDate = new Date(2026, 4 + i, 15); // May through October
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 7);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post1.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Говь – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 1890000,
          currency: 'MNT',
          final_price: 1890000,
          capacity: 12,
          seats_booked: i % 2 === 0 ? Math.floor(Math.random() * 8) : 0,
          status: i < 2 ? 'OPEN' : 'DRAFT',
          public_note: 'Эрт захиалгын урамшуулал үйлчилнэ',
        },
      })
    );
  }

  // Sessions for Post 2 (Northern Mongolia)
  for (let i = 0; i < 4; i++) {
    const departureDate = new Date(2026, 5 + i, 1); // June through September
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 10);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post2.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Хойд бүс – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 2890000,
          currency: 'MNT',
          final_price: 2890000,
          capacity: 10,
          seats_booked: i === 0 ? 6 : 0,
          status: i < 3 ? 'OPEN' : 'DRAFT',
        },
      })
    );
  }

  // Sessions for Post 3 (Central Mongolia)
  for (let i = 0; i < 8; i++) {
    const departureDate = new Date(2026, 3 + i, 5); // April through November
    const returnDate = new Date(departureDate);
    returnDate.setDate(returnDate.getDate() + 5);

    sessions.push(
      await prisma.departureSession.create({
        data: {
          post_id: post3.id,
          package_option_id: 'standard',
          departure_date: departureDate,
          return_date: returnDate,
          label: `Төв бүс – ${departureDate.toLocaleDateString('mn-MN', { month: 'long', year: 'numeric' })}`,
          base_price: 1190000,
          currency: 'MNT',
          discount_type: i % 3 === 0 ? 'PERCENT' : null,
          discount_value: i % 3 === 0 ? 10 : null,
          discount_reason: i % 3 === 0 ? 'Хаврын урамшуулал' : null,
          final_price: i % 3 === 0 ? 1071000 : 1190000,
          capacity: 15,
          seats_booked: i < 4 ? Math.floor(Math.random() * 10) : 0,
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
      total_price_snapshot: 3780000,
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
      total_price_snapshot: 3690000,
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
      total_price_snapshot: 7560000,
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
