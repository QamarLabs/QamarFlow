import { Templates } from '@/features/boards';
import Sidebar from '@/widgets/sidebar/Sidebar';
import Header from '@/widgets/header/Header';

export default function TemplatesPage() {
  return (
    <Sidebar>
      <Header title="Templates" />
      <Templates />
    </Sidebar>
  );
}
