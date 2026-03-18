import { Heading, Text, Button, RevealFx, Column, Row, Schema, Meta } from "@once-ui-system/core";
import { home, person, baseURL } from "@/resources";
import GalleryView from "@/components/gallery/GalleryView";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  const demoClientUrl =
    process.env.NEXT_PUBLIC_DEMO_CLIENT_URL ?? "https://client-demo.example.com";
  const demoAdminUrl =
    process.env.NEXT_PUBLIC_DEMO_ADMIN_URL ?? "https://admin-demo.example.com";

  return (
    <Column maxWidth="s" gap="xl" paddingY="12" horizontal="center" fillWidth>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: baseURL,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {/* Headline */}
      <Column fillWidth horizontal="center" align="center" gap="m" paddingTop="32">
        <RevealFx fillWidth horizontal="center">
          <Heading wrap="balance" variant="display-strong-l" align="center">
            {home.headline}
          </Heading>
        </RevealFx>
        <RevealFx delay={0.1} fillWidth horizontal="center">
          <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-l" align="center">
            {home.subline}
          </Text>
        </RevealFx>
      </Column>

      {/* CTA buttons */}
      <RevealFx delay={0.2} fillWidth>
        <Row fillWidth gap="12" s={{ direction: "column" }}>
          <Button
            href={demoClientUrl}
            variant="primary"
            size="l"
            weight="strong"
            arrowIcon
            fillWidth
          >
            Клиент хэсэг үзэх
          </Button>
          <Button
            href={demoAdminUrl}
            variant="secondary"
            size="l"
            weight="default"
            arrowIcon
            fillWidth
          >
            Админ хэсэг үзэх
          </Button>
        </Row>
      </RevealFx>

      {/* System explanation */}
      <RevealFx delay={0.3} fillWidth>
        <Column fillWidth gap="20" padding="24" border="neutral-alpha-medium" radius="xl" background="surface">
          <Heading as="h2" variant="display-strong-xs" wrap="balance">
            Систем хэрхэн ажилладаг вэ?
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            Аялал платформ нь <strong>Клиент</strong> болон <strong>Админ</strong> гэсэн хоёр хэсгээс
            бүрддэг. Админ хэсгээс аяллын багц үүсгэж, засварлаж, нийтлэхэд клиент хэсэг
            автоматаар шинэчлэгдэж хэрэглэгчдэд шууд харагдана.
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            <strong>Клиент хэсэг</strong> — аяллын багц хайх, харьцуулах, захиалга өгөх,
            онлайн төлбөр хийх боломжтой хэрэглэгчийн интерфэйс.
          </Text>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="pretty">
            <strong>Админ хэсэг</strong> — агуулга удирдлага, захиалгын мониторинг, хэрэглэгч
            болон үйлчилгээ үзүүлэгчийн бүрэн хяналтын самбар.
          </Text>
        </Column>
      </RevealFx>

      {/* Photo gallery */}
      <RevealFx delay={0.4} fillWidth>
        <GalleryView />
      </RevealFx>
    </Column>
  );
}
