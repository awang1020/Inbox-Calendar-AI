import { TaskProvider } from "@/context/TaskContext";
import { TaskPageContainer } from "@/components/layout/TaskPageContainer";
import { CalendarView } from "@/components/views/CalendarView";

export default function CalendarPage() {
  return (
    <TaskProvider>
      <TaskPageContainer>
        {(props) => <CalendarView {...props} />}
      </TaskPageContainer>
    </TaskProvider>
  );
}
