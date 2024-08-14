import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
//import { prisma } from '~/db.server'
export async function action({ request }: ActionFunctionArgs) {
  // const count = await prisma.issue.count()
  // if (count > 100) {
  //   return { success: false }
  // }
  // await prisma.issue.create({
  //   data: {
  //     title: 'Item title ' + Math.random(),
  //     count: 1,
  //     description: 'Item description',
  //     draftId: Math.random().toString(),
  //   },
  // })
  return {
    success: true,
  }
}
export async function loader({ request }: LoaderFunctionArgs) {
  // const data = await prisma.issue.findMany()
  // return json({
  //   data,
  // })
  return json({ data: [] })
}
export default function Index() {
  // const { data } = useLoaderData<typeof loader>()
  return (
    <div>
      <h1> Items </h1>
      {/* <ul>
        {data.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
      <Form method="POST">
        <input type="submit" value="Submit" />
      </Form> */}
    </div>
  )
}
