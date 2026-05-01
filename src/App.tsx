import { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TodayIcon from '@mui/icons-material/Today';
import HistoryIcon from '@mui/icons-material/History';
import BarChartIcon from '@mui/icons-material/BarChart';
import dayjs from 'dayjs';
import { DailyRecord, loadRecords, saveRecords } from './lib/storage';

type Tab = 'today' | 'history' | 'stats';

const QUICK_VALUES = [1, 3, 5, 10];

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [records, setRecords] = useState<DailyRecord[]>(loadRecords);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repsInput, setRepsInput] = useState('5');

  const today = dayjs().format('YYYY-MM-DD');

  const todayRecord = useMemo(
    () => records.find((record) => record.date === today) ?? { date: today, sets: [] },
    [records, today],
  );

  const addSet = (reps: number) => {
    if (!Number.isFinite(reps) || reps <= 0) return;

    setRecords((current) => {
      const index = current.findIndex((record) => record.date === today);
      const next = [...current];
      if (index === -1) {
        next.push({ date: today, sets: [reps] });
      } else {
        next[index] = { ...next[index], sets: [...next[index].sets, reps] };
      }
      saveRecords(next);
      return next;
    });
  };

  const orderedHistory = useMemo(
    () => [...records].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [records],
  );

  const last7 = useMemo(() => {
    const from = dayjs().subtract(6, 'day');
    return records.filter((record) => dayjs(record.date).isAfter(from.subtract(1, 'day')));
  }, [records]);

  const stats = useMemo(() => {
    const totals = records.map((record) => sum(record.sets));
    const best = totals.length ? Math.max(...totals) : 0;
    const weeklyTotal = last7.reduce((acc, record) => acc + sum(record.sets), 0);
    const avg7 = Math.round((weeklyTotal / 7) * 10) / 10;
    return { best, weeklyTotal, avg7 };
  }, [last7, records]);

  return (
    <Box sx={{ pb: 9 }}>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar>
          <Typography variant="h6" fontWeight={700}>
            Pull-Ups Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        {tab === 'today' && (
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">Сегодня</Typography>
                <Typography variant="h3" fontWeight={800}>
                  {sum(todayRecord.sets)}
                </Typography>
                <Typography color="text.secondary">подтягиваний</Typography>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {QUICK_VALUES.map((value) => (
                <Chip key={value} label={`+${value}`} onClick={() => addSet(value)} clickable />
              ))}
            </Stack>

            <Card>
              <CardContent>
                <Typography variant="h6">Подходы за день</Typography>
                <List dense>
                  {todayRecord.sets.length === 0 && (
                    <ListItem>
                      <ListItemText primary="Пока нет записей" />
                    </ListItem>
                  )}
                  {todayRecord.sets.map((set, index) => (
                    <ListItem key={`${set}-${index}`}>
                      <ListItemText primary={`Подход ${index + 1}`} secondary={`${set} повторений`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        )}

        {tab === 'history' && (
          <Card>
            <CardContent>
              <Typography variant="h6">История</Typography>
              <List>
                {orderedHistory.length === 0 && (
                  <ListItem>
                    <ListItemText primary="История пуста" />
                  </ListItem>
                )}
                {orderedHistory.map((record) => (
                  <ListItem key={record.date}>
                    <ListItemText
                      primary={dayjs(record.date).format('DD MMM YYYY')}
                      secondary={`Всего: ${sum(record.sets)} | Подходов: ${record.sets.length}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {tab === 'stats' && (
          <Stack spacing={2}>
            <Card>
              <CardContent>
                <Typography color="text.secondary">Лучший день</Typography>
                <Typography variant="h4" fontWeight={700}>{stats.best}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary">Общий объем (7 дней)</Typography>
                <Typography variant="h4" fontWeight={700}>{stats.weeklyTotal}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary">Среднее за день (7 дней)</Typography>
                <Typography variant="h4" fontWeight={700}>{stats.avg7}</Typography>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 88, right: 20 }}
        onClick={() => setDialogOpen(true)}
        aria-label="Добавить"
      >
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Добавить подход</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Количество повторений"
            fullWidth
            value={repsInput}
            onChange={(event) => setRepsInput(event.target.value)}
            type="number"
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => {
              addSet(Number(repsInput));
              setDialogOpen(false);
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <BottomNavigation
        showLabels
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction value="today" label="Today" icon={<TodayIcon />} />
        <BottomNavigationAction value="history" label="History" icon={<HistoryIcon />} />
        <BottomNavigationAction value="stats" label="Stats" icon={<BarChartIcon />} />
      </BottomNavigation>
    </Box>
  );
}
