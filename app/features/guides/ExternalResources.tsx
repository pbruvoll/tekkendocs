import { Heading } from '@radix-ui/themes'
import { type ExternalResource } from './GuideData'

export const ExternalResources = ({
  externalResources,
}: {
  externalResources: ExternalResource[]
}) => {
  return (
    <section className="my-4 mb-8">
      <Heading as="h2" mb="2" size="4">
        External resources
      </Heading>
      <ul>
        {externalResources.map(resource => (
          <li key={resource.name}>
            <a
              className="block py-1 text-text-primary"
              target="_blank"
              href={resource.url}
              rel="noreferrer"
            >
              {resource.name}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
