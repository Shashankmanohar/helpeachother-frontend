import { useState } from "react";
import { Key, Plus, CheckCircle2, Circle, XCircle, Trash2, Ban, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@admin/hooks/use-mobile";
import { toast } from "sonner";
import { PIN_BASE_PRICE, PIN_ADMIN_CHARGE_PERCENT, PIN_TOTAL_PRICE, type Pin } from "@admin/lib/mock-data";
import { formatCurrency } from "@admin/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const PinsPage = () => {
  const isMobile = useIsMobile();
  const [pins, setPins] = useState<Pin[]>([]);
  const [count, setCount] = useState(1);

  const handleGenerate = () => {
    if (count < 1 || count > 100) {
      toast.error("Enter a count between 1 and 100");
      return;
    }
    const newPins: Pin[] = Array.from({ length: count }, (_, i) => ({
      id: `PIN-${String(pins.length + i + 1).padStart(6, '0')}`,
      code: generateCode(),
      status: 'available' as const,
      assignedTo: '—',
      price: PIN_BASE_PRICE,
      adminCharge: Math.round(PIN_BASE_PRICE * PIN_ADMIN_CHARGE_PERCENT / 100),
      totalPrice: PIN_TOTAL_PRICE,
      createdAt: new Date().toISOString(),
    }));
    setPins(prev => [...newPins, ...prev]);
    toast.success(`${count} pin(s) generated @ ${formatCurrency(PIN_TOTAL_PRICE)} each`);
  };

  const handleDeactivate = (id: string) => {
    setPins(prev => prev.map(p => p.id === id ? { ...p, status: 'deactivated' as const } : p));
    toast.success("Pin deactivated");
  };

  const handleDelete = (id: string) => {
    setPins(prev => prev.filter(p => p.id !== id));
    toast.success("Pin deleted");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Pin code copied");
  };

  const available = pins.filter(p => p.status === 'available').length;
  const used = pins.filter(p => p.status === 'used').length;
  const deactivated = pins.filter(p => p.status === 'deactivated').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Pin Management</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Pin Price: {formatCurrency(PIN_BASE_PRICE)} + {PIN_ADMIN_CHARGE_PERCENT}% admin = <span className="font-semibold text-foreground">{formatCurrency(PIN_TOTAL_PRICE)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Count"
            className="w-20 bg-secondary border-border"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          />
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleGenerate}>
            <Plus className="h-3.5 w-3.5" /> Generate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Available', count: available, icon: CheckCircle2, color: 'text-success' },
          { label: 'Used', count: used, icon: Circle, color: 'text-primary' },
          { label: 'Deactivated', count: deactivated, icon: XCircle, color: 'text-muted-foreground' },
        ].map((s) => (
          <div key={s.label} className="metric-card text-center">
            <s.icon className={`mx-auto mb-1.5 h-5 w-5 ${s.color}`} />
            <p className={`text-2xl font-bold sm:text-3xl ${s.color}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {pins.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16">
          <Key className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No pins generated yet</p>
          <p className="text-xs text-muted-foreground/60">Click "Generate" to create activation pins</p>
        </div>
      ) : isMobile ? (
        <AnimatePresence>
          <div className="space-y-2.5">
            {pins.map((pin, i) => (
              <motion.div
                key={pin.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${pin.status === 'available' ? 'bg-success/10' : pin.status === 'used' ? 'bg-info/10' : 'bg-muted'
                    }`}>
                    <Key className={`h-4 w-4 ${pin.status === 'available' ? 'text-success' : pin.status === 'used' ? 'text-info' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">{pin.code}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(pin.totalPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={
                    pin.status === 'available' ? 'status-badge-success' :
                      pin.status === 'used' ? 'status-badge-info' : 'status-badge-destructive'
                  }>{pin.status}</span>
                  {pin.status === 'available' && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(pin.code)}><Copy className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-warning hover:bg-warning/10" onClick={() => handleDeactivate(pin.id)}><Ban className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pin.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="data-table-header px-4 py-3 text-left">Pin ID</th>
                <th className="data-table-header px-4 py-3 text-left">Code</th>
                <th className="data-table-header px-4 py-3 text-center">Status</th>
                <th className="data-table-header px-4 py-3 text-left">Assigned To</th>
                <th className="data-table-header px-4 py-3 text-right">Base Price</th>
                <th className="data-table-header px-4 py-3 text-right">Admin ({PIN_ADMIN_CHARGE_PERCENT}%)</th>
                <th className="data-table-header px-4 py-3 text-right">Total</th>
                <th className="data-table-header px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {pins.map((pin) => (
                  <motion.tr
                    key={pin.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pin.id}</td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">{pin.code}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={pin.status === 'available' ? 'status-badge-success' : pin.status === 'used' ? 'status-badge-info' : 'status-badge-destructive'}>{pin.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pin.assignedTo}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(pin.price)}</td>
                    <td className="px-4 py-3 text-right text-warning">{formatCurrency(pin.adminCharge)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(pin.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(pin.code)}><Copy className="h-3.5 w-3.5" /></Button>
                        {pin.status === 'available' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-warning hover:bg-warning/10" onClick={() => handleDeactivate(pin.id)}><Ban className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(pin.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PinsPage;
