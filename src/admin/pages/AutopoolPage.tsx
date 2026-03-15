import { useState } from "react";
import { autopoolTiers as initialTiers, type AutopoolTier } from "@admin/lib/mock-data";
import { formatCurrency } from "@admin/lib/formatters";
import { Layers, Play, Pause, RotateCcw, Users, CheckCircle2, Zap, Plus, Snowflake, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AutopoolPage = () => {
  const [tiers, setTiers] = useState<AutopoolTier[]>(initialTiers);
  const [addDialog, setAddDialog] = useState<number | null>(null);
  const [memberId, setMemberId] = useState("");

  const handleFreeze = (index: number) => {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, frozen: !t.frozen } : t));
    toast.success(tiers[index].frozen ? `${tiers[index].tier} pool unfrozen` : `${tiers[index].tier} pool frozen`);
  };

  const handleReset = (index: number) => {
    setTiers(prev => prev.map((t, i) => i === index ? { ...t, members: [], completed: [], active: [] } : t));
    toast.success(`${tiers[index].tier} pool reset`);
  };

  const handleAddMember = (index: number) => {
    if (!memberId.trim()) {
      toast.error("Enter a valid User ID");
      return;
    }
    if (tiers[index].frozen) {
      toast.error("Pool is frozen");
      return;
    }
    setTiers(prev => prev.map((t, i) => i === index ? {
      ...t,
      members: [...t.members, memberId],
      active: [...t.active, memberId],
    } : t));
    toast.success(`${memberId} added to ${tiers[index].tier} pool`);
    setMemberId("");
    setAddDialog(null);
  };

  const handleForceComplete = (tierIndex: number, userId: string) => {
    setTiers(prev => prev.map((t, i) => i === tierIndex ? {
      ...t,
      active: t.active.filter(id => id !== userId),
      completed: [...t.completed, userId],
    } : t));
    toast.success(`${userId} marked complete in ${tiers[tierIndex].tier}`);
  };

  const handleRemoveMember = (tierIndex: number, userId: string) => {
    setTiers(prev => prev.map((t, i) => i === tierIndex ? {
      ...t,
      members: t.members.filter(id => id !== userId),
      active: t.active.filter(id => id !== userId),
      completed: t.completed.filter(id => id !== userId),
    } : t));
    toast.success(`${userId} removed from ${tiers[tierIndex].tier}`);
  };

  const handleFreezeAll = () => {
    setTiers(prev => prev.map(t => ({ ...t, frozen: true })));
    toast.success("All pools frozen");
  };

  const handleResetAll = () => {
    setTiers(prev => prev.map(t => ({ ...t, members: [], completed: [], active: [] })));
    toast.success("All pools reset");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Autopool Management</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Manage pool tiers, members, and payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-warning border-warning/30 hover:bg-warning/10" onClick={handleFreezeAll}>
            <Pause className="h-3.5 w-3.5" /> Freeze All
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleResetAll}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <AnimatePresence>
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`metric-card space-y-4 relative overflow-hidden ${tier.frozen ? 'border-warning/30' : ''}`}
            >
              {tier.frozen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Snowflake className="h-4 w-4 text-warning animate-pulse" />
                </motion.div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    className="rounded-xl bg-primary/10 p-2.5"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Layers className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-base font-bold text-foreground sm:text-lg">{tier.tier}</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">Reward: {formatCurrency(tier.reward)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => setAddDialog(index)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${tier.frozen ? 'text-success' : 'text-warning'} hover:bg-warning/10`} onClick={() => handleFreeze(index)}>
                    {tier.frozen ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleReset(index)}>
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <motion.div className="rounded-xl bg-secondary p-2.5" whileHover={{ scale: 1.05 }}>
                  <Users className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-base font-bold text-foreground sm:text-lg">{tier.members.length}</p>
                  <p className="text-[10px] text-muted-foreground">Members</p>
                </motion.div>
                <motion.div className="rounded-xl bg-secondary p-2.5" whileHover={{ scale: 1.05 }}>
                  <CheckCircle2 className="mx-auto mb-1 h-3.5 w-3.5 text-success" />
                  <p className="text-base font-bold text-success sm:text-lg">{tier.completed.length}</p>
                  <p className="text-[10px] text-muted-foreground">Done</p>
                </motion.div>
                <motion.div className="rounded-xl bg-secondary p-2.5" whileHover={{ scale: 1.05 }}>
                  <Zap className="mx-auto mb-1 h-3.5 w-3.5 text-warning" />
                  <p className="text-base font-bold text-warning sm:text-lg">{tier.active.length}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </motion.div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: tier.members.length > 0 ? `${(tier.completed.length / tier.members.length) * 100}%` : '0%' }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Member list */}
              {tier.active.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border">
                  <p className="text-[10px] text-muted-foreground font-medium">Active Members</p>
                  <AnimatePresence>
                    {tier.active.map((userId) => (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between rounded-lg bg-secondary/50 px-2.5 py-1.5"
                      >
                        <span className="font-mono text-xs text-foreground">{userId}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-success hover:bg-success/10" onClick={() => handleForceComplete(index, userId)}>
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveMember(index, userId)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addDialog !== null} onOpenChange={() => setAddDialog(null)}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Member to {addDialog !== null ? tiers[addDialog].tier : ''} Pool
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">User ID</label>
              <Input
                placeholder="e.g. USR-0001"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="mt-1 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAddDialog(null)}>Cancel</Button>
              <Button size="sm" onClick={() => addDialog !== null && handleAddMember(addDialog)}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutopoolPage;
