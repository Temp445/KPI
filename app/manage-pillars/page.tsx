"use client";

import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

const ManagePillars = () => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1581BF");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>();

  const [data, setData] = useState<any[]>([]);

  const [editId, setEditId] = useState<string | null>(null);
  const { user} = useAuth();

const fetchData = async () => {
  const { data, error } = await supabase.from("kpi_categories").select("*");
  if (!error) setData(data);
};

useEffect(() => {
  fetchData();
}, []);

  
  const resetForm = () => {
    setEditId(null);
    setName("");
    setColor("#1581BF");
    setIcon("");
    setDisplayOrder(undefined);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (editId) {
      // UPDATE MODE
      const { error } = await supabase
        .from("kpi_categories")
        .update({ name, color, icon, display_order: displayOrder })
        .eq("id", editId);

      setLoading(false);

      if (!user) {
            toast({
              title: "Unauthorized",
              description: "Access denied. Only logged-in users can update this data.",
              variant: "destructive",
            });
            return;
          }

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        
      } else {
        toast({
          title: "Updated",
          description: "Pillar updated successfully!",
          variant: "success",
        });
        resetForm();
        fetchData(); 
      }
    } else {
      // INSERT MODE
      const { error } = await supabase
        .from("kpi_categories")
        .insert([{ name, color, icon, display_order: displayOrder }]);

      setLoading(false);

      if (!user) {
            toast({
              title: "Unauthorized",
              description: "Access denied. Only logged-in users can create new data.",
              variant: "destructive",
            });
            return;
          }

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Data uploaded successfully!",
          variant: "success",
        });
       resetForm();
       fetchData(); 
      }
    }
  };


  const handleDelete = async (id: string) => {
    
      const { error } = await supabase
        .from("kpi_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
     if (!error) {
      toast({
        title: "Deleted",
        description: "Item deleted successfully",
        variant: "success",
      });
      fetchData(); 
    }

    if (!user) {
      toast({
        title: "Unauthorized",
        description: "Access denied. Only logged-in users can delete this data.",
        variant: "destructive",
      });
      return;
    }
   
  };

  return (
      <div className="h-fit p-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <div className="mb-10">
                  <h1 className="text-2xl font-bold  mb-2">Pillars Management</h1>
                  <p className="">Create and manage your Pillars</p>
                </div>
                <div className=" border  rounded-xl p-6 sticky top-6">
                  <h2 className="text-xl font-semibold  mb-6 flex items-center gap-2">
                    {editId ? "Edit KPI pillar" : "Create New Pillar"}
                  </h2>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium ">
                       Pillar Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Production"
                        value={name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setName(val);
                          setIcon(val ? val.charAt(0).toUpperCase() : "");
                        }}
                        required
                        className="border rounded-lg px-4 py-2.5  focus:outline-none "
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium ">
                        Pillar Color <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-14 h-10 rounded border  cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          placeholder="#1581BF"
                          className="flex-1  border   rounded-lg px-4 py-2.5  focus:outline-none  text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium ">
                        Display Order <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="1"
                        value={displayOrder}
                        onChange={(e) =>
                          setDisplayOrder(Number(e.target.value))
                        }
                        required
                        className=" border   rounded-lg px-4 py-2.5  focus:outline-none "
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600  font-semibold py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>{editId ? "Edit Pillar" : "Add Pillar"}</>
                      )}
                    </button>

                    {editId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(null);
                          setName("");
                          setColor("#1581BF");
                          setIcon("");
                          setDisplayOrder(undefined);
                        }}
                        className="w-full text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold py-2.5 rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="border  rounded-xl p-6">
                <h2 className="text-xl font-semibold  mb-6">Pillars</h2>

                {data.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="">
                      No Pillars yet. Create one to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.map((item) => (
                      <div
                        key={item.id}
                        className=" border  rounded-lg p-4 hover:border-slate-500 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white  flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            >
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">{item.name}</p>
                              <div className="flex flex-col xl:flex-row xl:items-center xl:gap-4 text-sm  mt-2">
                                <span className="font-mono">{item.color}</span>
                                <span className="text-slate-500">
                                  Order: {item.display_order}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="hover:text-blue-600 transition p-2"
                            onClick={() => {
                              setEditId(item.id);
                              setName(item.name);
                              setColor(item.color);
                              setIcon(item.icon);
                              setDisplayOrder(item.display_order);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="hover:text-red-600 transition p-2"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ManagePillars;
