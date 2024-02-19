import { db } from "@/lib/db"

export async function GET() {
  function formatDate(date: Date) {
    // Define the abbreviations for the days and months
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]

    // Format the date as 'Day Month Year'
    let formattedDate = `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`

    // Format minutes with leading zero if necessary
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")

    // Date with time
    formattedDate = `${formattedDate} ${hours}:${minutes}`

    return formattedDate
  }
  function formatDateBack(dateString: string) {
    // Split the date string into parts
    const parts = dateString.split(" ")
    const dayNumber = parts[1]
    const monthName = parts[2]
    const year = parts[3]
    const time = parts[4]

    // Define the full names for the days and months
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]

    // Find the index of the day and month in their arrays
    const monthIndex = months.indexOf(monthName)

    // Create a new Date object
    const date = new Date(`${year}-${monthIndex + 1}-${dayNumber} ${time}`)

    return date
  }

  // First check if any outstanding tasks need ticking completed
  console.log("##### Running incomplete tasks check #####")
  try {
    const incompleteTasks = await db.task.findMany({
      where: {
        completed: false,
      },
    })
    for (const task of incompleteTasks) {
      const date = formatDateBack(task.checkDate!)
      const randMins = Math.floor(Math.random() * 15)
      const randSecs = Math.floor(Math.random() * 60)
      date.setMinutes(date.getMinutes() + randMins)
      date.setSeconds(date.getSeconds() + randSecs)

      if (date < new Date()) {
        await db.task.update({
          where: {
            id: task.id,
          },
          data: {
            completed: true,
            completedBy: "Mike Pearce",
            completedAt: date,
          },
        })
        console.log("Updated task: ", task.checkDate)
      } else {
        console.log("Task not yet due: ", task.checkDate)
      }
    }
  } catch (error) {
    console.error(error)
    return new Response("Error getting and updating incomplete tasks", {
      status: 500,
    })
  }

  // Then check if there are any new tasks that need to be created
  // todaysDate needs to be yesterdays date so -1 day
  const yeseterday = new Date(new Date().setDate(new Date().getDate() - 1))
  const todaysDate = new Date()
  const tomorrowDate = new Date(todaysDate.setDate(todaysDate.getDate() + 1))
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  console.log(
    "##### Running new daily checks for: " + formatDate(tomorrowDate) + " #####"
  )
  let latestTask
  try {
    // Get the latest task
    latestTask = await db.task.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error(error)
  }

  // Determine if there are any new tasks that need to be created for the following day
  // by checking the date element only (slicing)
  let latestTaskDate = latestTask?.checkDate
  latestTaskDate = latestTaskDate?.slice(0, latestTaskDate?.length - 5)
  let tomorrowDateFormatted = formatDate(tomorrowDate)
  tomorrowDateFormatted = tomorrowDateFormatted.slice(
    0,
    tomorrowDateFormatted.length - 5
  )
  console.log("Latest task date: " + latestTaskDate)
  console.log("Tomorrow date: " + tomorrowDateFormatted)

  if (latestTaskDate === tomorrowDateFormatted) {
    console.log("##### No new tasks needed #####")
    return new Response("No new tasks need creating")
  } else {
    // First check the day of the week
    const dayOfWeek = daysOfWeek[todaysDate.getDay()]
    // If Sunday, we do not need a new task
    if (dayOfWeek === "Sunday") {
      console.log("No new tasks needed for Sunday")
      return new Response("No new tasks need creating for Sunday")
      // If Saturday, we need a new task at 2pm
    } else if (dayOfWeek === "Saturday") {
      // convert the date to the format Sat 5 Jan 2024 14:00, for example
      let formattedDate = formatDate(tomorrowDate)
      // change the last 5 characters (12:43) to 14:00
      formattedDate = formattedDate.slice(0, formattedDate.length - 5) + "14:00"

      try {
        // Create new Saturday task
        await db.task.create({
          data: {
            name: "PM Check " + dayOfWeek,
            description: "PM Check Sat",
            checkDate: formattedDate,
          },
        })
        console.log("New task created " + dayOfWeek)
        return new Response("New task created " + dayOfWeek)
      } catch (error) {
        console.error(error)
        return new Response("Error creating new task for " + dayOfWeek)
      }
      // Otherwise if Mon - Fri we need 2 new tasks for 10:30 and 15:00
    } else {
      console.log("2 New tasks needed for " + dayOfWeek)
      let formatTomorrowDate = formatDate(tomorrowDate)
      try {
        // Create new tasks
        formatTomorrowDate =
          formatTomorrowDate.slice(0, formatTomorrowDate.length - 5) + "10:30"
        await db.task.create({
          data: {
            name: "AM Check",
            description: "AM Check",
            checkDate: formatTomorrowDate,
          },
        })
        formatTomorrowDate =
          formatTomorrowDate.slice(0, formatTomorrowDate.length - 5) + "15:00"
        await db.task.create({
          data: {
            name: "PM Check",
            description: "PM Check",
            checkDate: formatTomorrowDate,
          },
        })
        console.log("New tasks created for " + dayOfWeek)
        return new Response("New tasks created " + dayOfWeek)
      } catch (error) {
        console.error(error)
        return new Response("Could not create tasks for " + dayOfWeek)
      }
    }
  }
}
