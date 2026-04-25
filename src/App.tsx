/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Activity, 
  Bot, 
  PieChart, 
  Flame, 
  BarChart3, 
  Mail, 
  Check, 
  Star, 
  Menu, 
  X, 
  ArrowRight, 
  Clock, 
  Zap, 
  Shield, 
  Smile,
  Send,
  User,
  LogOut,
  Calendar,
  Settings,
  Bell,
  Plus,
  Search,
  Apple,
  CloudSun,
  Coffee,
  Moon,
  Plus as PlusIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Data and Types ---

interface Exercise {
  id: string;
  name: string;
  category: 'Strength' | 'Cardio' | 'Yoga' | 'HIIT';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationOrReps: string;
  caloriesPerMinute: number;
  targetMuscles: string[];
  instructions: string[];
  formTips: string;
  type: 'timed' | 'reps';
}

interface WorkoutLog {
  id: string;
  date: string;
  exerciseName: string;
  duration: number; // in seconds
  calories: number;
  stars: number;
  sets?: number;
}

const exerciseLibrary: Exercise[] = [
  // Strength
  {
    id: 's1', name: 'Push-ups', category: 'Strength', difficulty: 'Beginner', durationOrReps: '12 Reps',
    caloriesPerMinute: 8, targetMuscles: ['Chest', 'Triceps', 'Shoulders'], type: 'reps',
    instructions: ['Place hands shoulder-width apart', 'Lower body until chest nearly touches floor', 'Push back up to start'],
    formTips: 'Keep your core tight and body in a straight line.'
  },
  {
    id: 's2', name: 'Bodyweight Squats', category: 'Strength', difficulty: 'Beginner', durationOrReps: '15 Reps',
    caloriesPerMinute: 6, targetMuscles: ['Quads', 'Glutes', 'Hamstrings'], type: 'reps',
    instructions: ['Stand with feet shoulder-width apart', 'Lower hips as if sitting in a chair', 'Keep chest up and weight on heels', 'Return to standing'],
    formTips: 'Don\'t let your knees cave inward.'
  },
  {
    id: 's3', name: 'Plank', category: 'Strength', difficulty: 'Intermediate', durationOrReps: '60 Seconds',
    caloriesPerMinute: 4, targetMuscles: ['Core', 'Abs', 'Shoulders'], type: 'timed',
    instructions: ['Rest on forearms and toes', 'Keep body in straight line', 'Engage core and glutes'],
    formTips: 'Avoid letting your hips sag or hike up high.'
  },
  {
    id: 's4', name: 'Lunges', category: 'Strength', difficulty: 'Beginner', durationOrReps: '10 per leg',
    caloriesPerMinute: 7, targetMuscles: ['Legs', 'Glutes'], type: 'reps',
    instructions: ['Step forward with one leg', 'Lower hips until both knees are bent at 90 degrees', 'Push back to start'],
    formTips: 'Keep your front knee over your ankle.'
  },
  {
    id: 's5', name: 'Dips', category: 'Strength', difficulty: 'Intermediate', durationOrReps: '10 Reps',
    caloriesPerMinute: 8, targetMuscles: ['Triceps', 'Chest'], type: 'reps',
    instructions: ['Use a stable chair or bench', 'Lower body by bending elbows', 'Push back up'],
    formTips: 'Keep your elbows tucked in near your body.'
  },
  // Cardio
  {
    id: 'c1', name: 'Jumping Jacks', category: 'Cardio', difficulty: 'Beginner', durationOrReps: '60 Seconds',
    caloriesPerMinute: 10, targetMuscles: ['Full Body'], type: 'timed',
    instructions: ['Start with feet together, arms at side', 'Jump out while bringing arms above head', 'Jump back to start'],
    formTips: 'Stay light on the balls of your feet.'
  },
  {
    id: 'c2', name: 'Mountain Climbers', category: 'Cardio', difficulty: 'Intermediate', durationOrReps: '45 Seconds',
    caloriesPerMinute: 12, targetMuscles: ['Core', 'Shoulders', 'Legs'], type: 'timed',
    instructions: ['Start in plank position', 'Rapidly alternate bringing knees toward chest', 'Keep back flat'],
    formTips: 'Run with your legs, don\'t just kick your feet.'
  },
  {
    id: 'c3', name: 'High Knees', category: 'Cardio', difficulty: 'Intermediate', durationOrReps: '60 Seconds',
    caloriesPerMinute: 11, targetMuscles: ['Legs', 'Abs'], type: 'timed',
    instructions: ['Run in place', 'Bring knees as high as possible', 'Pump arms for momentum'],
    formTips: 'Land softly on your midfoot.'
  },
  {
    id: 'c4', name: 'Burpees', category: 'Cardio', difficulty: 'Advanced', durationOrReps: '10 Reps',
    caloriesPerMinute: 15, targetMuscles: ['Full Body'], type: 'reps',
    instructions: ['Squat down and place hands on floor', 'Jump feet back to plank', 'Do a pushup', 'Jump feet forward and jump up'],
    formTips: 'Maintain a steady rhythm rather than rushing.'
  },
  {
    id: 'c5', name: 'Shadow Boxing', category: 'Cardio', difficulty: 'Beginner', durationOrReps: '3 Minutes',
    caloriesPerMinute: 9, targetMuscles: ['Arms', 'Shoulders', 'Core'], type: 'timed',
    instructions: ['Maintain a boxing stance', 'Throw light punches at imaginary target', 'Keep feet moving'],
    formTips: 'Exhale with every punch.'
  },
  // Yoga
  {
    id: 'y1', name: 'Downward Dog', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '60 Seconds',
    caloriesPerMinute: 3, targetMuscles: ['Hamstrings', 'Shoulders', 'Back'], type: 'timed',
    instructions: ['Start on hands and knees', 'Lift hips toward ceiling', 'Press heels toward floor'],
    formTips: 'Spread fingers wide and push the floor away.'
  },
  {
    id: 'y2', name: 'Surya Namaskar', category: 'Yoga', difficulty: 'Intermediate', durationOrReps: '5 Rounds',
    caloriesPerMinute: 5, targetMuscles: ['Full Body'], type: 'reps',
    instructions: ['Follow the 12-pose sequence', 'Coordinate movement with breath', 'Move fluidly'],
    formTips: 'Focus on stretching the spine in both directions.'
  },
  {
    id: 'y3', name: 'Warrior II', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '45s per side',
    caloriesPerMinute: 3, targetMuscles: ['Legs', 'Arms'], type: 'timed',
    instructions: ['Wide stance, turn one foot out 90 deg', 'Bend front knee, arms horizontal', 'Look over front hand'],
    formTips: 'Keep your torso upright and centered.'
  },
  {
    id: 'y4', name: 'Tree Pose', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '60s per side',
    caloriesPerMinute: 2, targetMuscles: ['Legs', 'Balance'], type: 'timed',
    instructions: ['Stand on one leg', 'Place other foot on inner thigh', 'Hands in prayer position'],
    formTips: 'Find a focal point to help with balance.'
  },
  {
    id: 'y5', name: 'Cobra Pose', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '30 Seconds',
    caloriesPerMinute: 3, targetMuscles: ['Lower Back', 'Abs'], type: 'timed',
    instructions: ['Lie on stomach', 'Hands under shoulders', 'Straighten arms slightly to lift chest'],
    formTips: 'Keep your shoulders down and away from ears.'
  }
];

// Add more to fill up to 30 exercises total
exerciseLibrary.push(
  { id: 's6', name: 'Diamond Push-ups', category: 'Strength', difficulty: 'Advanced', durationOrReps: '10 Reps', caloriesPerMinute: 9, targetMuscles: ['Triceps', 'Chest'], type: 'reps', instructions: ['Hands in diamond shape under chest', 'Lower until chest touches hands', 'Push back up'], formTips: 'Keep elbows tucked.' },
  { id: 'c6', name: 'Star Jumps', category: 'Cardio', difficulty: 'Advanced', durationOrReps: '30 Seconds', caloriesPerMinute: 14, targetMuscles: ['Full Body'], type: 'timed', instructions: ['Squat slightly', 'Jump up and extend arms/legs into star', 'Land softly'], formTips: 'Explosive movement is key.' },
  { id: 'y6', name: 'Child\'s Pose', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '2 Minutes', caloriesPerMinute: 1.5, targetMuscles: ['Lower Back', 'Hips'], type: 'timed', instructions: ['Kneel on floor', 'Sit back on heels', 'Lean forward and rest forehead on floor'], formTips: 'Breathe deeply into your back.' },
  { id: 'h6', name: 'Tuck Jumps', category: 'HIIT', difficulty: 'Advanced', durationOrReps: '30 Seconds', caloriesPerMinute: 16, targetMuscles: ['Legs', 'Abs'], type: 'timed', instructions: ['Jump as high as possible', 'Bring knees to chest in mid-air', 'Land softly'], formTips: 'Don\'t lean too far forward.' },
  { id: 's7', name: 'Step-ups', category: 'Strength', difficulty: 'Beginner', durationOrReps: '12 per leg', caloriesPerMinute: 7, targetMuscles: ['Quads', 'Glutes'], type: 'reps', instructions: ['Step onto a box with one foot', 'Drive through heel to lift entire body', 'Step back down'], formTips: 'Keep your knee stable.' },
  { id: 'c7', name: 'Rope Skipping', category: 'Cardio', difficulty: 'Intermediate', durationOrReps: '2 Minutes', caloriesPerMinute: 12, targetMuscles: ['Full Body'], type: 'timed', instructions: ['Rotate wrists to swing rope', 'Jump just high enough for rope to pass', 'Stay on balls of feet'], formTips: 'Keep elbows close to sides.' },
  { id: 'y7', name: 'Bridge Pose', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '60 Seconds', caloriesPerMinute: 3, targetMuscles: ['Glutes', 'Lower Back'], type: 'timed', instructions: ['Lie on back, knees bent', 'Lift hips toward ceiling', 'Interlace fingers under back'], formTips: 'Push your chest toward your chin.' },
  { id: 'h7', name: 'Plank Jacks', category: 'HIIT', difficulty: 'Intermediate', durationOrReps: '45 Seconds', caloriesPerMinute: 10, targetMuscles: ['Core', 'Heart'], type: 'timed', instructions: ['Start in plank', 'Jump feet out wide and then back together', 'Stay in straight line'], formTips: 'Don\'t let your hips bounce too much.' },
  { id: 's8', name: 'Wall Sit', category: 'Strength', difficulty: 'Beginner', durationOrReps: '60 Seconds', caloriesPerMinute: 4, targetMuscles: ['Quads'], type: 'timed', instructions: ['Lean against a wall', 'Slide down until thighs are parallel to floor', 'Hold position'], formTips: 'Keep your back flat against the wall.' },
  { id: 'c8', name: 'Butt Kicks', category: 'Cardio', difficulty: 'Beginner', durationOrReps: '60 Seconds', caloriesPerMinute: 9, targetMuscles: ['Hamstrings'], type: 'timed', instructions: ['Run in place', 'Bring heels all the way to glutes', 'Pump arms'], formTips: 'Stay light on your feet.' },
  { id: 'y8', name: 'Cat-Cow Pose', category: 'Yoga', difficulty: 'Beginner', durationOrReps: '2 Minutes', caloriesPerMinute: 2, targetMuscles: ['Spine'], type: 'timed', instructions: ['On hands and knees', 'Inhale: arch back (Cow)', 'Exhale: round back (Cat)'], formTips: 'Flow with your breath.' },
  { id: 'h8', name: 'Bicycle Crunches', category: 'HIIT', difficulty: 'Intermediate', durationOrReps: '45 Seconds', caloriesPerMinute: 7, targetMuscles: ['Abs', 'Obliques'], type: 'timed', instructions: ['Lie on back, hands behind head', 'Bring right elbow to left knee', 'Switch sides in fluid motion'], formTips: 'Focus on twisting from the core.' },
  { id: 's9', name: 'Pull-ups', category: 'Strength', difficulty: 'Advanced', durationOrReps: '8 Reps', caloriesPerMinute: 9, targetMuscles: ['Back', 'Biceps'], type: 'reps', instructions: ['Hang from bar with overhand grip', 'Pull body up until chin is over bar', 'Lower under control'], formTips: 'Control the descent.' },
  { id: 'c9', name: 'Lateral Skaters', category: 'Cardio', difficulty: 'Intermediate', durationOrReps: '45 Seconds', caloriesPerMinute: 11, targetMuscles: ['Legs', 'Glutes'], type: 'timed', instructions: ['Jump sideways from one foot to other', 'Swing arms across body', 'Land with soft knee'], formTips: 'Stay low for more challenge.' },
  { id: 'y9', name: 'Pigeon Pose', category: 'Yoga', difficulty: 'Intermediate', durationOrReps: '60s per side', caloriesPerMinute: 2, targetMuscles: ['Hips', 'Glutes'], type: 'timed', instructions: ['Bring one knee forward behind wrist', 'Lower hips as back leg straightens', 'Lean forward if comfortable'], formTips: 'Keep your hips squared.' }
);

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Components ---

const Navbar = ({ onGetStarted, activeView }: { onGetStarted: () => void, activeView: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">HealthifyYou</span>
        </div>

        {activeView === 'landing' && (
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Pricing', 'Testimonials'].map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
                className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        )}

        <button 
          onClick={onGetStarted}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          {activeView === 'landing' ? 'Get Started' : 'Dashboard'}
        </button>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index, colorClass }: { icon: any, title: string, description: string, index: number, colorClass: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 card-hover"
  >
    <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center font-bold`}>
      <Icon size={20} />
    </div>
    <h3 className="font-bold text-slate-800">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex items-center gap-4">
    <div className="text-3xl font-bold text-emerald-200">{number}</div>
    <div>
      <h4 className="font-bold text-xs uppercase text-slate-400 tracking-widest">{title}</h4>
      <p className="text-sm text-slate-700">{description}</p>
    </div>
  </div>
);

const PricingCard = ({ tier, price, features, highlighted, onSelect }: { tier: string, price: string, features: string[], highlighted?: boolean, onSelect: () => void }) => (
  <div className={`p-8 rounded-3xl flex flex-col ${highlighted ? 'bg-emerald-600 text-white scale-105 shadow-2xl shadow-emerald-200 z-10' : 'bg-white text-slate-900 border border-slate-100 shadow-sm'}`}>
    <h3 className="text-xl font-bold mb-2">{tier}</h3>
    <div className="flex items-baseline gap-1 mb-6">
      <span className="text-4xl font-extrabold">{price}</span>
      <span className={highlighted ? 'text-emerald-100' : 'text-slate-500'}>/month</span>
    </div>
    <ul className="space-y-4 mb-8 flex-grow">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-3">
          <div className={`p-1 rounded-full ${highlighted ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
            <Check size={16} />
          </div>
          <span className={highlighted ? 'text-emerald-50' : 'text-slate-600'}>{f}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${highlighted ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg- emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100'}`}
    >
      Choose {tier}
    </button>
  </div>
);

interface Food {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  isFavorite?: boolean;
}

interface MealEntry {
  id: string;
  foodId: string;
  name: string;
  multiplier: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

interface DailyMealLog {
  breakfast: MealEntry[];
  morningSnack: MealEntry[];
  lunch: MealEntry[];
  eveningSnack: MealEntry[];
  dinner: MealEntry[];
  water: number;
}

const foodDatabase: Food[] = [
  // Indian
  { id: 'i1', name: 'Dal Tadka', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 154, protein: 7, carbs: 18, fats: 6, fiber: 4 },
  { id: 'i2', name: 'Roti (Whole Wheat)', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 71, protein: 3, carbs: 15, fats: 0.4, fiber: 2 },
  { id: 'i3', name: 'Steamed Rice', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 205, protein: 4, carbs: 45, fats: 0.4, fiber: 1 },
  { id: 'i4', name: 'Paneer Tikka', category: 'Indian', servingSize: 1, servingUnit: 'plate', calories: 280, protein: 18, carbs: 8, fats: 20, fiber: 2 },
  { id: 'i5', name: 'Chicken Curry', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 240, protein: 28, carbs: 6, fats: 12, fiber: 2 },
  { id: 'i6', name: 'Dosa (Plain)', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 120, protein: 3, carbs: 24, fats: 2, fiber: 1 },
  { id: 'i7', name: 'Idli', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 58, protein: 2, carbs: 12, fats: 0.1, fiber: 1 },
  { id: 'i8', name: 'Sambar', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 95, protein: 4, carbs: 14, fats: 3, fiber: 3 },
  { id: 'i9', name: 'Veg Biryani', category: 'Indian', servingSize: 1, servingUnit: 'plate', calories: 350, protein: 8, carbs: 54, fats: 11, fiber: 5 },
  { id: 'i10', name: 'Chicken Biryani', category: 'Indian', servingSize: 1, servingUnit: 'plate', calories: 480, protein: 25, carbs: 58, fats: 16, fiber: 4 },
  { id: 'i11', name: 'Aloo Paratha', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 210, protein: 4, carbs: 32, fats: 7, fiber: 3 },
  { id: 'i12', name: 'Chole Masala', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 220, protein: 8, carbs: 34, fats: 6, fiber: 8 },
  { id: 'i13', name: 'Rajma', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 215, protein: 9, carbs: 32, fats: 5, fiber: 9 },
  { id: 'i14', name: 'Palak Paneer', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 250, protein: 14, carbs: 10, fats: 18, fiber: 4 },
  { id: 'i15', name: 'Poha', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 180, protein: 4, carbs: 34, fats: 3, fiber: 2 },
  { id: 'i16', name: 'Upma', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 192, protein: 5, carbs: 36, fats: 4, fiber: 3 },
  { id: 'i17', name: 'Khichdi', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 175, protein: 6, carbs: 32, fats: 3, fiber: 4 },
  { id: 'i18', name: 'Raita (Mixed)', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 60, protein: 3, carbs: 5, fats: 3, fiber: 1 },
  { id: 'i19', name: 'Lassi (Sweet)', category: 'Indian', servingSize: 1, servingUnit: 'glass', calories: 150, protein: 5, carbs: 22, fats: 4, fiber: 0 },
  { id: 'i20', name: 'Buttermilk', category: 'Indian', servingSize: 1, servingUnit: 'glass', calories: 40, protein: 2.5, carbs: 4, fats: 1.5, fiber: 0 },
  { id: 'i21', name: 'Medhu Vada', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 97, protein: 2.5, carbs: 9, fats: 6, fiber: 1.5 },
  { id: 'i22', name: 'Egg Bhurji', category: 'Indian', servingSize: 1, servingUnit: 'plate', calories: 180, protein: 12, carbs: 4, fats: 13, fiber: 1 },
  { id: 'i23', name: 'Moong Dal Chilla', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 120, protein: 6, carbs: 18, fats: 3, fiber: 4 },
  { id: 'i24', name: 'Puri', category: 'Indian', servingSize: 1, servingUnit: 'piece', calories: 100, protein: 2, carbs: 12, fats: 5, fiber: 1 },
  { id: 'i25', name: 'Bhindi Masala', category: 'Indian', servingSize: 1, servingUnit: 'bowl', calories: 110, protein: 3, carbs: 12, fats: 6, fiber: 4 },
  
  // Proteins
  { id: 'p1', name: 'Chicken Breast (Grilled)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  { id: 'p2', name: 'Egg (Whole)', category: 'Proteins', servingSize: 1, servingUnit: 'large', calories: 70, protein: 6, carbs: 0.6, fats: 5, fiber: 0 },
  { id: 'p3', name: 'Salmon (Grilled)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 208, protein: 22, carbs: 0, fats: 13, fiber: 0 },
  { id: 'p4', name: 'Tofu (Firm)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 83, protein: 10, carbs: 2, fats: 5, fiber: 1 },
  { id: 'p5', name: 'Greek Yogurt (Plain)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0 },
  { id: 'p6', name: 'Whey Protein', category: 'Proteins', servingSize: 1, servingUnit: 'scoop', calories: 120, protein: 24, carbs: 3, fats: 1.5, fiber: 0 },
  { id: 'p7', name: 'Red Lentils (Cooked)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 8 },
  { id: 'p8', name: 'Paneer (Raw)', category: 'Proteins', servingSize: 100, servingUnit: 'g', calories: 265, protein: 18, carbs: 3, fats: 20, fiber: 0 },
  
  // Grains
  { id: 'g1', name: 'Oats (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'bowl', calories: 150, protein: 5, carbs: 27, fats: 3, fiber: 4 },
  { id: 'g2', name: 'Brown Rice (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'bowl', calories: 216, protein: 5, carbs: 45, fats: 1.8, fiber: 3.5 },
  { id: 'g3', name: 'Quinoa (Cooked)', category: 'Grains', servingSize: 1, servingUnit: 'bowl', calories: 222, protein: 8, carbs: 39, fats: 3.6, fiber: 5 },
  { id: 'g4', name: 'Whole Wheat Bread', category: 'Grains', servingSize: 1, servingUnit: 'slice', calories: 75, protein: 3.5, carbs: 13, fats: 1, fiber: 2 },
  { id: 'g5', name: 'Muesli', category: 'Grains', servingSize: 1, servingUnit: 'cup', calories: 280, protein: 8, carbs: 55, fats: 5, fiber: 7 },
  
  // Fruits
  { id: 'f1', name: 'Banana', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 105, protein: 1.3, carbs: 27, fats: 0.4, fiber: 3 },
  { id: 'f2', name: 'Apple', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 95, protein: 0.5, carbs: 25, fats: 0.3, fiber: 4.5 },
  { id: 'f3', name: 'Mango', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 150, protein: 1.5, carbs: 38, fats: 0.6, fiber: 3.5 },
  { id: 'f4', name: 'Orange', category: 'Fruits', servingSize: 1, servingUnit: 'medium', calories: 62, protein: 1.2, carbs: 15, fats: 0.2, fiber: 3 },
  { id: 'f5', name: 'Papaya', category: 'Fruits', servingSize: 1, servingUnit: 'cup', calories: 62, protein: 0.7, carbs: 16, fats: 0.4, fiber: 2.5 },
  { id: 'f6', name: 'Watermelon', category: 'Fruits', servingSize: 1, servingUnit: 'cup', calories: 46, protein: 0.9, carbs: 12, fats: 0.2, fiber: 0.6 },
  { id: 'f7', name: 'Grapes', category: 'Fruits', servingSize: 1, servingUnit: 'cup', calories: 104, protein: 1.1, carbs: 27, fats: 0.2, fiber: 1.4 },
  
  // Vegetables
  { id: 'v1', name: 'Broccoli', category: 'Vegetables', servingSize: 100, servingUnit: 'g', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  { id: 'v2', name: 'Sweet Potato', category: 'Vegetables', servingSize: 1, servingUnit: 'medium', calories: 103, protein: 2.3, carbs: 24, fats: 0.2, fiber: 3.8 },
  { id: 'v3', name: 'Spinach (Cooked)', category: 'Vegetables', servingSize: 1, servingUnit: 'cup', calories: 41, protein: 5, carbs: 7, fats: 0.5, fiber: 4.3 },
  { id: 'v4', name: 'Cucumber', category: 'Vegetables', servingSize: 1, servingUnit: 'large', calories: 45, protein: 2, carbs: 11, fats: 0.5, fiber: 1.5 },
  { id: 'v5', name: 'Tomato', category: 'Vegetables', servingSize: 1, servingUnit: 'medium', calories: 22, protein: 1, carbs: 5, fats: 0.2, fiber: 1.5 },
  { id: 'v6', name: 'Carrot', category: 'Vegetables', servingSize: 1, servingUnit: 'medium', calories: 25, protein: 0.6, carbs: 6, fats: 0.1, fiber: 1.7 },
  
  // Beverages
  { id: 'b1', name: 'Water', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
  { id: 'b2', name: 'Green Tea', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0 },
  { id: 'b3', name: 'Black Coffee', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 5, protein: 0.3, carbs: 0, fats: 0, fiber: 0 },
  { id: 'b4', name: 'Milk (Full Cream)', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 150, protein: 8, carbs: 12, fats: 8, fiber: 0 },
  { id: 'b5', name: 'Orange Juice', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 110, protein: 1.7, carbs: 26, fats: 0.5, fiber: 0.5 },
  { id: 'b6', name: 'Coconut Water', category: 'Beverages', servingSize: 250, servingUnit: 'ml', calories: 45, protein: 2, carbs: 9, fats: 0.5, fiber: 2.6 },
  
  // Snacks
  { id: 'sn1', name: 'Makhana (Roasted)', category: 'Snacks', servingSize: 1, servingUnit: 'cup', calories: 100, protein: 3, carbs: 20, fats: 1, fiber: 2 },
  { id: 'sn2', name: 'Almonds', category: 'Snacks', servingSize: 10, servingUnit: 'pieces', calories: 70, protein: 2.5, carbs: 2.5, fats: 6, fiber: 1.5 },
  { id: 'sn3', name: 'Dry Fruits Mix', category: 'Snacks', servingSize: 30, servingUnit: 'g', calories: 150, protein: 4, carbs: 15, fats: 8, fiber: 3 },
  { id: 'sn4', name: 'Granola Bar', category: 'Snacks', servingSize: 1, servingUnit: 'bar', calories: 120, protein: 3, carbs: 18, fats: 4, fiber: 2.5 },
  { id: 'sn5', name: 'Dark Chocolate (70%)', category: 'Snacks', servingSize: 1, servingUnit: 'square', calories: 60, protein: 0.7, carbs: 4.5, fats: 4.5, fiber: 1 },
  { id: 'sn6', name: 'Peanut Butter', category: 'Snacks', servingSize: 1, servingUnit: 'tbsp', calories: 95, protein: 4, carbs: 3, fats: 8, fiber: 1 },
];

const AICoach = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Hello! I'm your AI Health Coach. How can I help you reach your fitness goals today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `You are a professional health and fitness coach. Answer the following user question concisely and encouragingly: ${userMsg}` }] }
        ],
      });
      
      const botMsg = response.text || "I'm sorry, I couldn't process that request right now.";
      setMessages(prev => [...prev, { role: 'bot', text: botMsg }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having some trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 border-bottom border-slate-100 bg-emerald-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">AI Personal Coach</h3>
          <p className="text-xs text-emerald-600 font-medium">Powered by Gemini AI • Always Online</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'}`}>
              <p className="text-sm font-medium">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about health, diet, or workouts..."
            className="flex-grow px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Workout Session and Plan Components ---

const WorkoutSession = ({ exercise, onFinish, onCancel }: { exercise: Exercise, onFinish: (log: WorkoutLog) => void, onCancel: () => void }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [sets, setSets] = useState(1);
  const [repCount, setRepCount] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    let interval: any;
    if (isActive && !isResting && !isFinished) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(s => s - 1);
      }, 1000);
    } else if (isResting && restSeconds === 0) {
      setIsResting(false);
      setSets(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, isResting, restSeconds, isFinished]);

  const calories = Math.floor((seconds / 60) * exercise.caloriesPerMinute);

  const handleFinish = () => {
    setIsFinished(true);
  };

  return (
    <div className="fixed inset-0 bg-navy-900 z-[100] flex flex-col p-8 overflow-y-auto">
       <div className="max-w-xl mx-auto w-full flex flex-col items-center gap-12 py-12">
          <div className="text-center space-y-2">
             <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Now Tracking</h3>
             <h2 className="text-4xl font-extrabold text-white">{exercise.name}</h2>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="144" cy="144" r="130" stroke="white" strokeWidth="8" fill="transparent" opacity="0.1" />
                <motion.circle 
                  cx="144" cy="144" r="130" 
                  stroke="#00C853" strokeWidth="8" fill="transparent" 
                  strokeDasharray="816" 
                  animate={{ strokeDashoffset: 816 - (816 * (seconds % 60) / 60) }}
                />
             </svg>
             <div className="text-center z-10">
                <p className="text-6xl font-black text-white font-mono">
                  {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                </p>
                <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">{isResting ? 'Rest Timer' : 'Elapsed'}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center backdrop-blur">
                <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Calories</p>
                <p className="text-3xl font-black text-white">{calories}</p>
             </div>
             <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center backdrop-blur">
                <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Intensity</p>
                <p className="text-3xl font-black text-white">High</p>
             </div>
          </div>

          {exercise.type === 'reps' ? (
            <div className="w-full space-y-6">
               <div className="flex justify-between items-end">
                  <p className="text-white font-bold">Set <span className="text-primary-green text-3xl font-black">{sets}</span> of 3</p>
                  <div className="flex gap-2">
                     {[30, 60, 90].map(t => (
                       <button key={t} onClick={() => setRestSeconds(t)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${restSeconds === t ? 'bg-emerald-500 border-emerald-500 text-navy-900' : 'border-white/20 text-white hover:bg-white/10'}`}>
                          {t}s
                       </button>
                     ))}
                  </div>
               </div>
               <div className="flex items-center justify-between p-8 bg-white/10 rounded-[2.5rem] border border-white/10">
                  <button onClick={() => setRepCount(c => Math.max(0, c - 1))} className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><X size={32} /></button>
                  <div className="text-center">
                     <p className="text-7xl font-black text-white">{repCount}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Reps Done</p>
                  </div>
                  <button onClick={() => setRepCount(c => c + 1)} className="w-16 h-16 rounded-full bg-primary-green text-navy-900 flex items-center justify-center hover:bg-emerald-400 transition-all active:scale-90"><PlusIcon size={32} /></button>
               </div>
               <button 
                 onClick={() => { setIsResting(true); setRestSeconds(60); setRepCount(0); }}
                 className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-5 rounded-2xl font-bold transition-all text-xl"
               >
                 Complete Set
               </button>
            </div>
          ) : (
            <div className="w-full bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
               <p className="text-emerald-400 text-sm font-medium mb-2 italic">"Focus on your breathing. You're doing great!"</p>
               <div className="flex justify-center gap-1">
                  {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
               </div>
            </div>
          )}

          <div className="flex gap-4 w-full">
             <button onClick={onCancel} className="flex-1 bg-white/5 text-white/50 py-5 rounded-2xl font-bold hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/10">Skip</button>
             <button onClick={handleFinish} className="flex-1 bg-primary-green text-navy-900 py-5 rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 text-xl">Finish Workout</button>
          </div>
       </div>

       {isFinished && (
         <div className="fixed inset-0 bg-navy-900/90 backdrop-blur-md z-[110] flex items-center justify-center p-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center space-y-8 shadow-2xl"
            >
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={48} strokeWidth={3} />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-navy-900 mb-2">Workout Complete!</h2>
                  <p className="text-slate-500">Amazing job! Your stats have been recorded.</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                     <p className="text-xl font-bold text-navy-900">{Math.floor(seconds / 60)}m {seconds % 60}s</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Burned</p>
                     <p className="text-xl font-bold text-navy-900">{calories} kcal</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <p className="text-sm font-bold text-navy-900 uppercase tracking-widest">Rate your effort</p>
                  <div className="flex justify-center gap-2">
                     {[1,2,3,4,5].map(i => (
                       <button key={i} onClick={() => setRating(i)} className={`p-2 transition-all ${rating >= i ? 'text-orange-400' : 'text-slate-200'}`}>
                          <Star size={32} fill={rating >= i ? 'currentColor' : 'none'} />
                       </button>
                     ))}
                  </div>
               </div>
               <button 
                 onClick={() => onFinish({ id: Math.random().toString(), date: new Date().toISOString(), exerciseName: exercise.name, duration: seconds, calories, stars: rating, sets: sets })} 
                 className="w-full bg-navy-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all active:scale-95"
               >
                 Save & Return
               </button>
            </motion.div>
         </div>
       )}
    </div>
  );
};

const WeeklyPlan = ({ plan, onRegenerate, onBack }: { plan: any, onRegenerate: () => void, onBack: () => void }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [expanded, setExpanded] = useState<string | null>('Mon');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
       <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-navy-900 transition-colors font-bold text-sm uppercase tracking-widest">
            <ArrowRight size={18} className="rotate-180" /> Back
          </button>
          <button onClick={onRegenerate} className="text-emerald-600 font-bold text-sm hover:underline">Regenerate My Plan</button>
       </div>

       <div>
          <h2 className="text-4xl font-extrabold text-navy-900 mb-2">My Weekly Plan</h2>
          <p className="text-slate-500">Custom tailored for you.</p>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {days.map(day => {
            const d = plan[day];
            const isExp = expanded === day;
            return (
              <div key={day} className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all ${isExp ? 'ring-2 ring-emerald-500/20' : ''}`}>
                 <div 
                   onClick={() => setExpanded(isExp ? null : day)}
                   className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                 >
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${d.isRest ? 'bg-slate-100 text-slate-400' : 'bg-emerald-500 text-navy-900'}`}>
                          {day[0]}
                       </div>
                       <div>
                          <h4 className="font-bold text-navy-900">{day} - {d.type}</h4>
                          <p className="text-xs text-slate-400">{d.isRest ? 'Rest & Recovery' : `${d.exercises?.length || 3} Exercises • ~45 min`}</p>
                       </div>
                    </div>
                    <ArrowRight className={`text-slate-300 transition-transform ${isExp ? 'rotate-90' : ''}`} />
                 </div>
                 
                 <AnimatePresence>
                    {isExp && !d.isRest && (
                      <motion.div 
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="px-6 pb-6 pt-0 border-t border-slate-50 overflow-hidden"
                      >
                         <div className="space-y-3 mt-6">
                            {(d.exercises || []).map((ex: Exercise) => (
                              <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-emerald-50 transition-colors">
                                 <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-500 shadow-sm">
                                       <Zap size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{ex.name}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.durationOrReps}</span>
                              </div>
                            ))}
                            <button className="w-full mt-4 bg-primary-green text-navy-900 py-4 rounded-xl font-bold hover:bg-emerald-400 transition-all">
                               Start Today's Workout
                            </button>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            );
          })}
       </div>
    </div>
  );
};

// --- Main Views ---

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-8 py-20 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-12 lg:col-span-6 flex flex-col justify-center gap-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 bg-lime-accent rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">v2.0 Beta Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Your AI-Powered <br />
              <span className="text-primary-green">Health Companion</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              Transform your life with precision fitness, nutrition tracking, and real-time AI coaching tailored to your unique biology.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onStart}
                className="bg-primary-green hover:bg-emerald-600 text-navy-900 px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all backdrop-blur-sm">
                Watch Demo
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="md:col-span-12 lg:col-span-6 relative"
          >
            <div className="bg-white/5 rounded-3xl p-4 md:p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="aspect-video bg-navy-900/50 rounded-2xl overflow-hidden relative border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80" 
                  alt="Fitness Dashboard" 
                  className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center text-navy-900 shadow-xl shadow-primary-green/30">
                    <Zap size={32} fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid and beyond */}
      <section className="bg-white px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-navy-900 font-display tracking-tight mb-4">Precision Fitness Tracking</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Our advanced AI algorithms analyze your data to provide actionable insights tailored to your fitness journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Zap} 
              title="AI Workout" 
              description="Dynamic routines that adapt to your fatigue levels." 
              colorClass="bg-emerald-100 text-emerald-600"
              index={0}
            />
            <FeatureCard 
              icon={PieChart} 
              title="Calorie Tracker" 
              description="Snapshot scanning for instant meal analysis." 
              colorClass="bg-blue-100 text-blue-600"
              index={1}
            />
            <FeatureCard 
              icon={Activity} 
              title="Smart Dashboard" 
              description="All your health metrics in one unified view." 
              colorClass="bg-purple-100 text-purple-600"
              index={2}
            />
            <FeatureCard 
              icon={Bot} 
              title="AI Coach" 
              description="24/7 fitness guidance synced with Fitbit." 
              colorClass="bg-orange-100 text-orange-600"
              index={3}
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Analytics" 
              description="Deep-dive into your biometrics and trends." 
              colorClass="bg-rose-100 text-rose-600"
              index={4}
            />
            <FeatureCard 
              icon={Mail} 
              title="Email Reports" 
              description="Weekly summaries sent directly to your inbox." 
              colorClass="bg-indigo-100 text-indigo-600"
              index={5}
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white border-y border-slate-100 px-8 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Step 
            number="01" 
            title="Step One" 
            description="Sign Up" 
          />
          <Step 
            number="02" 
            title="Step Two" 
            description="Sync Devices" 
          />
          <Step 
            number="03" 
            title="Step Three" 
            description="Get Plan" 
          />
          <Step 
            number="04" 
            title="Step Four" 
            description="See Results" 
          />
        </div>
      </section>
      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-slate-600">Choose the plan that fits your health and fitness journey.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            tier="Free" 
            price="$0" 
            features={["Basic Workout Plan", "Manual Food Logging", "Standard Analytics", "Community Support"]} 
            onSelect={onStart}
          />
          <PricingCard 
            tier="Pro" 
            price="$19" 
            highlighted 
            features={["AI Workout Planner", "AI Meal Suggestions", "Wearable Device Sync", "Weekly Email Reports"]} 
            onSelect={onStart}
          />
          <PricingCard 
            tier="Premium" 
            price="$39" 
            features={["Priority AI Coaching", "Advanced Biometrics", "Custom Meal Plans", "Dedicated Health Dashboard"]} 
            onSelect={onStart}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-8 py-24 border-t border-slate-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-4">Loved by 50,000+ Users</h2>
          <p className="text-slate-500">Real stories from real people achieving real results.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-6 card-hover">
              <div className="flex gap-1 text-emerald-400">
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
                <Star fill="currentColor" size={14} />
              </div>
              <p className="text-slate-600 italic text-sm leading-relaxed">"HealthifyYou changed my perspective on fitness. The AI workout planner is so much better than any human trainer I've had!"</p>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Alex Johnson</h5>
                  <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Marathon Runner</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 p-12 md:p-16 text-xs mt-32">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex flex-wrap gap-12">
            <div>
              <h5 className="text-white font-bold mb-3 text-sm tracking-tight">Product</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 text-sm tracking-tight">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 text-sm tracking-tight">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-3 text-sm tracking-tight">Social</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                 <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="font-bold text-white tracking-tight">HealthifyYou</span>
            </div>
            <p>© 2024 HealthifyYou Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Meals Components ---

const CalorieProgressRing = ({ consumed, target }: { consumed: number; target: number }) => {
  const percentage = Math.min((consumed / target) * 100, 110);
  const color = percentage < 80 ? '#00C853' : percentage <= 100 ? '#FFAB00' : '#FF5252';
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="#F1F5F9"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="128"
          cy="128"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-navy-900">{consumed}</span>
        <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">/ {target} kcal</span>
      </div>
    </div>
  );
};

const MacroProgressBar = ({ label, consumed, target, color, unit = 'g' }: { label: string; consumed: number; target: number; color: string; unit?: string }) => {
  const percentage = Math.min((consumed / target) * 100, 100);
  
  return (
    <div className="flex-1 space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-navy-900">{consumed}{unit}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="text-[10px] text-slate-400 text-right">Goal: {target}{unit}</p>
    </div>
  );
};

const MealSectionCard = ({ 
  title, 
  icon: Icon, 
  items, 
  onAdd, 
  onDelete 
}: { 
  title: string; 
  icon: any; 
  items: MealEntry[]; 
  onAdd: () => void;
  onDelete: (id: string) => void;
}) => {
  const totalCals = items.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:border-emerald-200 transition-all">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-navy-900">
              <Icon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-navy-900">{title}</h4>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{totalCals} kcal</p>
            </div>
          </div>
          <button 
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-navy-900">{item.name}</span>
                <span className="text-[10px] text-slate-400">{item.multiplier}x serving • {item.calories} kcal</span>
              </div>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          )) : (
            <p className="text-center py-4 text-xs text-slate-400 italic">No foods logged yet. Tap + to add.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AddFoodModal = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  mealName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (food: Food, multiplier: number) => void;
  mealName: string;
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [customFoodForm, setCustomFoodForm] = useState(false);

  const filteredFoods = foodDatabase.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || f.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(foodDatabase.map(f => f.category)))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-navy-900/40"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Add to {mealName}</h2>
            <p className="text-slate-400 text-sm">Find your food ingredients</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-navy-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {!selectedFood ? (
            <>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search 80+ food items..." 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-primary-green text-navy-900' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredFoods.map((food) => (
                  <div 
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-all group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-navy-900">{food.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest">{food.category} • {food.calories} kcal / {food.servingUnit}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right hidden sm:block">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">P/C/F</p>
                          <p className="text-xs font-bold text-navy-900">{food.protein}/{food.carbs}/{food.fats}g</p>
                       </div>
                       <Plus size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className="w-full text-slate-400 text-xs font-bold hover:text-emerald-600 transition-colors py-4 border-2 border-dashed border-slate-100 rounded-2xl"
                onClick={() => setCustomFoodForm(true)}
              >
                Can't find your food? Add custom
              </button>
            </>
          ) : (
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                  <Apple size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-navy-900">{selectedFood.name}</h3>
                  <p className="text-slate-400">{selectedFood.calories} kcal per {selectedFood.servingUnit}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Protein</p>
                  <p className="font-bold text-navy-900">{selectedFood.protein}g</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Carbs</p>
                  <p className="font-bold text-navy-900">{selectedFood.carbs}g</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fats</p>
                  <p className="font-bold text-navy-900">{selectedFood.fats}g</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-navy-900 uppercase tracking-widest text-center">Select Portions</p>
                <div className="flex justify-center gap-3">
                   {[0.5, 1, 1.5, 2].map((m) => (
                     <button 
                       key={m}
                       onClick={() => setMultiplier(m)}
                       className={`w-14 h-14 rounded-2xl text-sm font-bold transition-all ${multiplier === m ? 'bg-navy-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                     >
                       {m}x
                     </button>
                   ))}
                </div>
                <div className="flex items-center justify-center gap-4 pt-4">
                   <button onClick={() => setMultiplier(Math.max(0.1, multiplier - 0.1))} className="p-3 bg-slate-50 rounded-xl"><X size={16} /></button>
                   <input 
                     type="number" 
                     className="w-20 text-center text-xl font-bold bg-transparent border-b-2 border-slate-100" 
                     value={multiplier} 
                     onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                   />
                   <button onClick={() => setMultiplier(multiplier + 0.1)} className="p-3 bg-slate-50 rounded-xl"><Plus size={16} /></button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => setSelectedFood(null)} className="flex-1 py-4 bg-slate-100 text-navy-900 rounded-2xl font-bold">Back</button>
                 <button 
                   onClick={() => onAdd(selectedFood, multiplier)}
                   className="flex-2 py-4 bg-primary-green text-navy-900 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                 >
                   Add to {mealName}
                 </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const WaterTracker = ({ current, target, onUpdate }: { current: number; target: number; onUpdate: (val: number) => void }) => {
  const glasses = Math.ceil(target / 250);
  const filledGlasses = Math.floor(current / 250);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <Coffee size={24} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-navy-900">Water Intake</h3>
                <p className="text-slate-400 text-sm font-medium">{current}ml / {target}ml</p>
             </div>
          </div>
          <button 
            onClick={() => {
              const amount = prompt('Enter amount in ml:', '250');
              if (amount) onUpdate(current + parseInt(amount));
            }}
            className="text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Add Custom
          </button>
       </div>

       <div className="flex flex-wrap gap-4 mb-8">
          {[...Array(glasses)].map((_, i) => (
            <button 
              key={i}
              onClick={() => onUpdate(Math.min((i + 1) * 250, target))}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${i < filledGlasses ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}
            >
              <Coffee size={18} fill={i < filledGlasses ? 'currentColor' : 'none'} />
            </button>
          ))}
       </div>

       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((current/target)*100, 100)}%` }}
            className="h-full bg-blue-500 rounded-full"
          />
       </div>
    </div>
  );
};

const DashboardView = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [workoutView, setWorkoutView] = useState<'home' | 'detail' | 'session' | 'plan'>('home');
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);
  
  const [userProfile, setUserProfile] = useState<any>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { 
      dailyCalories: 2200, 
      macros: { protein: 150, carbs: 250, fats: 70 },
      waterGoal: 3000
    };
  });

  const [mealHistory, setMealHistory] = useState<{ [date: string]: DailyMealLog }>(() => {
    const saved = localStorage.getItem('mealHistory');
    return saved ? JSON.parse(saved) : {};
  });

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [activeMealSection, setActiveMealSection] = useState<keyof DailyMealLog>('breakfast');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog: DailyMealLog = mealHistory[todayStr] || {
    breakfast: [], morningSnack: [], lunch: [], eveningSnack: [], dinner: [], water: 0
  };

  const totals = ['breakfast', 'morningSnack', 'lunch', 'eveningSnack', 'dinner'].reduce((acc, meal) => {
    const items = todayLog[meal as keyof DailyMealLog] as MealEntry[];
    items.forEach(item => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const updateMealLog = (newLog: DailyMealLog) => {
    const nextHistory = { ...mealHistory, [todayStr]: newLog };
    setMealHistory(nextHistory);
    localStorage.setItem('mealHistory', JSON.stringify(nextHistory));
  };

  const addFoodToMeal = (food: Food, multiplier: number) => {
    const entry: MealEntry = {
      id: Math.random().toString(36).substr(2, 9),
      foodId: food.id,
      name: food.name,
      multiplier,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      carbs: Math.round(food.carbs * multiplier),
      fats: Math.round(food.fats * multiplier),
      timestamp: new Date().toISOString()
    };

    const newLog = {
      ...todayLog,
      [activeMealSection]: [...(todayLog[activeMealSection] as MealEntry[]), entry]
    };
    updateMealLog(newLog);
    setIsAddFoodOpen(false);
  };

  const deleteFoodFromMeal = (meal: keyof DailyMealLog, id: string) => {
    const newLog = {
      ...todayLog,
      [meal]: (todayLog[meal] as MealEntry[]).filter(item => item.id !== id)
    };
    updateMealLog(newLog);
  };

  const updateWater = (val: number) => {
    const newLog = { ...todayLog, water: val };
    updateMealLog(newLog);
  };

  const [history, setHistory] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('workoutHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [plan, setPlan] = useState<any>(() => {
    const saved = localStorage.getItem('workoutPlan');
    return saved ? JSON.parse(saved) : null;
  });

  const saveWorkout = (log: WorkoutLog) => {
    const newHistory = [log, ...history];
    setHistory(newHistory);
    localStorage.setItem('workoutHistory', JSON.stringify(newHistory));
  };

  const generatePlan = () => {
    const profileStr = localStorage.getItem('userProfile');
    const profile = profileStr ? JSON.parse(profileStr) : { goal: 'Stay Fit', activityLevel: 'Moderate' };
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const goal = profile.goal || 'Stay Fit';
    const activity = profile.activityLevel || 'Moderate';
    
    // Frequency
    let workoutDaysCount = 3;
    if (activity === 'Moderate') workoutDaysCount = 4;
    if (activity === 'Very Active') workoutDaysCount = 5;
    if (activity === 'Athlete') workoutDaysCount = 6;

    // Distribution
    let categories: any[] = [];
    if (goal === 'Lose Weight') categories = ['Cardio', 'Cardio', 'Cardio', 'HIIT', 'HIIT', 'Strength', 'Strength', 'Yoga'];
    else if (goal === 'Build Muscle') categories = ['Strength', 'Strength', 'Strength', 'Strength', 'Cardio', 'Yoga'];
    else if (goal === 'Stay Fit') categories = ['Strength', 'Cardio', 'HIIT', 'Yoga'];
    else if (goal === 'Improve Endurance') categories = ['Cardio', 'Cardio', 'Cardio', 'HIIT', 'Strength', 'Yoga'];
    else categories = ['Strength', 'Strength', 'Strength', 'Cardio', 'Yoga'];

    const newPlan: any = {};
    let currentWorkoutDay = 0;
    
    days.forEach((day, idx) => {
      const shouldWorkout = (idx % (Math.floor(7 / workoutDaysCount)) === 0 && currentWorkoutDay < workoutDaysCount);
      
      if (shouldWorkout) {
        currentWorkoutDay++;
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const exercises = exerciseLibrary.filter(e => e.category === cat).slice(0, 3);
        newPlan[day] = {
          type: cat,
          exercises,
          isRest: false
        };
      } else {
        newPlan[day] = { isRest: true, type: 'Active Recovery' };
      }
    });

    setPlan(newPlan);
    localStorage.setItem('workoutPlan', JSON.stringify(newPlan));
    setWorkoutView('plan');
  };

  const tabs = [
    { icon: BarChart3, label: 'Dashboard' },
    { icon: Calendar, label: 'Workouts' },
    { icon: PieChart, label: 'Meals' },
    { icon: Bot, label: 'AI Coach' },
    { icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row pt-16 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col gap-8 fixed top-16 bottom-0 z-20">
        <div className="flex items-center gap-2 mb-2 p-2">
           <div className="w-8 h-8 bg-primary-green rounded-lg flex items-center justify-center">
             <div className="w-4 h-4 bg-white rounded-full"></div>
           </div>
           <span className="font-bold text-lg text-navy-900 tracking-tight">HealthifyYou</span>
        </div>

        <nav className="flex flex-col gap-2">
          {tabs.map((item) => (
            <button 
              key={item.label} 
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition-all group ${activeTab === item.label ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <item.icon size={20} className={activeTab === item.label ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
              {activeTab === item.label && <motion.div layoutId="desktop-tab" className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="p-4 bg-navy-900 rounded-2xl text-white mb-4">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">AI Insights</p>
            <p className="text-xs leading-relaxed italic">"Optimal recovery detected. A high-intensity session is recommended for today."</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-all rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around z-50 shadow-lg">
        {tabs.map((item) => (
          <button 
            key={item.label} 
            onClick={() => setActiveTab(item.label)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === item.label ? 'text-primary-green' : 'text-slate-400'}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 md:p-10">
        <header className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-3xl font-bold text-navy-900 font-display tracking-tight">{activeTab}</h2>
            {activeTab === 'Dashboard' && (
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400 font-medium">Daily Goal Progress</p>
                <p className="text-xl font-bold text-primary-green tracking-tight">85% Complete</p>
              </div>
            )}
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-primary-green" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {activeTab === 'Dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-sm font-bold uppercase">Steps</p>
                    <p className="text-4xl font-bold text-navy-900 mt-2">12,482</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase">
                      <BarChart3 size={12} /> Goal Exceeded
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-sm font-bold uppercase">Active Burn</p>
                    <p className="text-4xl font-bold text-navy-900 mt-2">840 <span className="text-sm font-normal text-slate-400">kcal</span></p>
                    <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-xs uppercase">
                      <Flame size={12} /> High Intensity
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-sm font-bold uppercase">Sleep Quality</p>
                    <p className="text-4xl font-bold text-navy-900 mt-2">Good</p>
                    <div className="mt-4 flex items-center gap-2 text-purple-500 font-bold text-xs uppercase">
                      <Clock size={12} /> 8h 12m Duration
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="placeholder-box min-h-[300px]">Overview Statistics</div>
                  <div className="placeholder-box min-h-[300px]">Activity Graph</div>
                </div>
              </div>
            )}

            {activeTab === 'Workouts' && (
              <div className="space-y-8">
                {workoutView === 'home' && (
                  <div className="space-y-8">
                    {/* Featured UI */}
                    <div className="bg-emerald-500 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                           <Zap size={20} fill="currentColor" />
                           <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">AI Suggested</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-2">Morning HIIT Burst</h3>
                        <p className="text-emerald-50 mb-6 max-w-md">Based on your activity level, this 15-minute routine will optimize your metabolism today.</p>
                        <button 
                          onClick={() => {
                            setSelectedEx(exerciseLibrary.find(e => e.id === 'h1') || null);
                            setWorkoutView('detail');
                          }}
                          className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg active:scale-95"
                        >
                          Start Suggested Workout
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm">
                        {['All', 'Strength', 'Cardio', 'Yoga', 'HIIT'].map(cat => (
                          <button key={cat} className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:bg-slate-50">
                            {cat}
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={generatePlan}
                        className="bg-primary-green hover:bg-emerald-600 text-navy-900 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                      >
                        <Calendar size={18} /> {plan ? 'View My Plan' : 'Generate My Weekly Plan'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {exerciseLibrary.slice(0, 9).map(ex => (
                        <div 
                          key={ex.id} 
                          onClick={() => { setSelectedEx(ex); setWorkoutView('detail'); }}
                          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 cursor-pointer hover:border-emerald-200 transition-all group"
                        >
                          <div className="flex justify-between items-start">
                             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                <Zap size={20} />
                             </div>
                             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 rounded-lg">{ex.category}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-navy-900 group-hover:text-emerald-600 transition-colors">{ex.name}</h4>
                            <p className="text-xs text-slate-400">{ex.durationOrReps} • {ex.caloriesPerMinute * 10} kcal • {ex.difficulty}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* History Section */}
                    <div className="pt-12 border-t border-slate-100">
                       <div className="flex justify-between items-end mb-8">
                          <div>
                             <h3 className="text-2xl font-bold text-navy-900 tracking-tight">Workout History</h3>
                             <p className="text-slate-400 text-sm">Your recent sessions and progress.</p>
                          </div>
                          <div className="flex gap-4">
                             <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center min-w-[80px]">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
                                <p className="text-lg font-bold text-orange-500">12 Days</p>
                             </div>
                             <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center min-w-[80px]">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Month</p>
                                <p className="text-lg font-bold text-emerald-500">24 Hits</p>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 space-y-4">
                             {history.length > 0 ? history.map(log => (
                               <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                        <Check size={20} />
                                     </div>
                                     <div>
                                        <h5 className="font-bold text-navy-900 text-sm">{log.exerciseName}</h5>
                                        <p className="text-xs text-slate-400">{new Date(log.date).toLocaleDateString()} • {Math.floor(log.duration / 60)}m {log.duration % 60}s</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-sm font-bold text-navy-900">{log.calories} kcal</p>
                                     <div className="flex gap-0.5 text-orange-400 mt-1">
                                        {[...Array(log.stars)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                                     </div>
                                  </div>
                               </div>
                             )) : (
                               <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                  <p className="text-slate-400 text-sm">No workouts tracked yet.</p>
                               </div>
                             )}
                          </div>
                          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
                             <h4 className="text-sm font-bold text-navy-900 mb-6 uppercase tracking-wider">Weekly Activity</h4>
                             <div className="flex items-end justify-between h-32 gap-2">
                                {[60, 45, 80, 55, 90, 30, 40].map((h, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-emerald-100 rounded-t-lg transition-all" style={{ height: `${h}%` }}>
                                      {h > 70 && <div className="w-full bg-emerald-500 rounded-t-lg h-1/2" />}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold">{"MTWTFSS"[i]}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {workoutView === 'detail' && selectedEx && (
                  <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    <button onClick={() => setWorkoutView('home')} className="flex items-center gap-2 text-slate-400 hover:text-navy-900 transition-colors font-bold text-sm uppercase tracking-widest">
                       <ArrowRight size={18} className="rotate-180" /> Back
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                       <div className="space-y-6">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest">{selectedEx.category}</span>
                          <h2 className="text-5xl font-extrabold text-navy-900 tracking-tight">{selectedEx.name}</h2>
                          <div className="flex flex-wrap gap-4">
                             {selectedEx.targetMuscles.map(m => (
                               <span key={m} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">{m}</span>
                             ))}
                          </div>
                          <p className="text-slate-500 leading-relaxed">{selectedEx.durationOrReps} focused routine designed for {selectedEx.difficulty} level athletes.</p>
                          <button 
                            onClick={() => setWorkoutView('session')}
                            className="w-full md:w-auto bg-primary-green hover:bg-emerald-600 text-navy-900 px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                          >
                            Start Exercise
                          </button>
                       </div>
                       
                       <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl relative aspect-square flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-emerald-50/30 opacity-50" />
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-white relative z-10 shadow-inner"
                          >
                            <Zap size={48} fill="currentColor" />
                          </motion.div>
                          <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur p-4 rounded-2xl border border-white/50 text-center">
                             <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Animated Movement Illustration</p>
                             <div className="flex justify-center gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <h4 className="text-xl font-bold text-navy-900">Instructions</h4>
                          <div className="space-y-4">
                             {selectedEx.instructions.map((step, i) => (
                               <div key={i} className="flex gap-4">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                                  <p className="text-slate-600 text-sm leading-relaxed pt-1">{step}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 space-y-4">
                          <h4 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                             <Shield size={20} /> Form Tips
                          </h4>
                          <p className="text-emerald-800 text-sm leading-relaxed bg-white/50 p-4 rounded-2xl border border-white/50">
                             {selectedEx.formTips}
                          </p>
                          <div className="flex items-center gap-4 pt-4">
                             <div className="flex-1 p-4 bg-white/50 rounded-2xl text-center">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase">Difficulty</p>
                                <p className="font-bold text-navy-900">{selectedEx.difficulty}</p>
                             </div>
                             <div className="flex-1 p-4 bg-white/50 rounded-2xl text-center">
                                <p className="text-[10px] text-emerald-600 font-bold uppercase">Burn Rate</p>
                                <p className="font-bold text-navy-900">~{selectedEx.caloriesPerMinute} / min</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {workoutView === 'session' && selectedEx && (
                  <WorkoutSession exercise={selectedEx} onFinish={(log) => { saveWorkout(log); setWorkoutView('home'); }} onCancel={() => setWorkoutView('home')} />
                )}

                {workoutView === 'plan' && plan && (
                  <WeeklyPlan plan={plan} onRegenerate={generatePlan} onBack={() => setWorkoutView('home')} />
                )}
              </div>
            )}

            {activeTab === 'Meals' && (
              <div className="space-y-8 pb-12">
                {/* Daily Overview */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
                   <CalorieProgressRing consumed={totals.calories} target={userProfile.dailyCalories || 2000} />
                   
                   <div className="flex-1 w-full space-y-8">
                      <div>
                         <h3 className="text-3xl font-black text-navy-900 tracking-tight">Today's Nutrition</h3>
                         <p className="text-slate-400 font-medium">Remaining: <span className="text-emerald-500 font-bold">{(userProfile.dailyCalories || 2000) - totals.calories} kcal</span></p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-8">
                         <MacroProgressBar 
                           label="Protein" 
                           consumed={totals.protein} 
                           target={userProfile.macros?.protein || 150} 
                           color="#3B82F6" 
                         />
                         <MacroProgressBar 
                           label="Carbs" 
                           consumed={totals.carbs} 
                           target={userProfile.macros?.carbs || 250} 
                           color="#F59E0B" 
                         />
                         <MacroProgressBar 
                           label="Fats" 
                           consumed={totals.fats} 
                           target={userProfile.macros?.fats || 70} 
                           color="#EC4899" 
                         />
                      </div>
                   </div>
                </div>

                {/* Meal Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <MealSectionCard 
                     title="Breakfast" 
                     icon={Zap} 
                     items={todayLog.breakfast} 
                     onAdd={() => { setActiveMealSection('breakfast'); setIsAddFoodOpen(true); }}
                     onDelete={(id) => deleteFoodFromMeal('breakfast', id)}
                   />
                   <MealSectionCard 
                     title="Morning Snack" 
                     icon={Apple} 
                     items={todayLog.morningSnack} 
                     onAdd={() => { setActiveMealSection('morningSnack'); setIsAddFoodOpen(true); }}
                     onDelete={(id) => deleteFoodFromMeal('morningSnack', id)}
                   />
                   <MealSectionCard 
                     title="Lunch" 
                     icon={CloudSun} 
                     items={todayLog.lunch} 
                     onAdd={() => { setActiveMealSection('lunch'); setIsAddFoodOpen(true); }}
                     onDelete={(id) => deleteFoodFromMeal('lunch', id)}
                   />
                   <MealSectionCard 
                     title="Evening Snack" 
                     icon={Coffee} 
                     items={todayLog.eveningSnack} 
                     onAdd={() => { setActiveMealSection('eveningSnack'); setIsAddFoodOpen(true); }}
                     onDelete={(id) => deleteFoodFromMeal('eveningSnack', id)}
                   />
                   <MealSectionCard 
                     title="Dinner" 
                     icon={Moon} 
                     items={todayLog.dinner} 
                     onAdd={() => { setActiveMealSection('dinner'); setIsAddFoodOpen(true); }}
                     onDelete={(id) => deleteFoodFromMeal('dinner', id)}
                   />
                   
                   <div className="lg:col-span-1">
                      <WaterTracker current={todayLog.water} target={userProfile.waterGoal || 3000} onUpdate={updateWater} />
                   </div>
                </div>

                {/* Recent Foods */}
                <div className="pt-12 border-t border-slate-100">
                   <div className="flex justify-between items-end mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-navy-900">Recent Foods</h3>
                        <p className="text-slate-400 text-sm">Quickly add items you've logged before.</p>
                      </div>
                      <button className="text-emerald-500 font-bold text-sm uppercase tracking-widest hover:underline">View Favorites</button>
                   </div>

                   <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {foodDatabase.slice(0, 10).map((food) => (
                        <button 
                          key={food.id}
                          onClick={() => { setActiveMealSection('breakfast'); addFoodToMeal(food, 1); }}
                          className="flex-shrink-0 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left w-48 hover:border-emerald-200 transition-all group"
                        >
                           <div className="flex justify-between items-start mb-3">
                              <Heart size={14} className="text-slate-200 group-hover:text-red-400 transition-colors" />
                              <Plus size={14} className="text-emerald-500" />
                           </div>
                           <p className="font-bold text-navy-900 text-sm truncate mb-1">{food.name}</p>
                           <p className="text-[10px] text-slate-400 uppercase tracking-widest">{food.calories} kcal</p>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Add Food Modal */}
                <AddFoodModal 
                  isOpen={isAddFoodOpen} 
                  onClose={() => setIsAddFoodOpen(false)} 
                  onAdd={addFoodToMeal} 
                  mealName={activeMealSection} 
                />
              </div>
            )}

            {activeTab === 'AI Coach' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                   <AICoach />
                </div>
                <div className="space-y-6">
                  <div className="placeholder-box min-h-[200px]">Voice Coaching</div>
                  <div className="placeholder-box min-h-[200px]">Smart Reminders</div>
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="max-w-2xl mx-auto space-y-8">
                {/* User Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-navy-900 rounded-3xl flex items-center justify-center text-primary-green font-bold text-3xl shadow-xl">
                    JD
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-2xl font-bold text-navy-900">Johnathan Doe</h3>
                    <p className="text-slate-500 font-medium mb-4">Elite Athlete • Member since 2024</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 font-bold text-sm border border-emerald-100 flex items-center gap-2">
                        BMI: 22.4 <Check size={14} />
                      </div>
                      <button 
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-50 rounded-xl text-red-600 font-bold text-sm border border-red-100 flex items-center gap-2 hover:bg-red-100 transition-colors"
                      >
                        Logout <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="placeholder-box min-h-[200px]">Account Settings</div>
                  <div className="placeholder-box min-h-[200px]">Integration Settings</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// --- Root Component ---

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  // Handle smooth scroll to top when switching views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-700">
      <Navbar onGetStarted={() => setView(v => v === 'landing' ? 'dashboard' : 'landing')} activeView={view} />
      
      <main>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <LandingPage onStart={() => setView('dashboard')} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DashboardView onLogout={() => setView('landing')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent UI Elements */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-4">
        <button className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 relative group transition-all">
           <Bell size={24} />
           <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></div>
           <div className="absolute bottom-full right-0 mb-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
             2 Health Tips
           </div>
        </button>
        <button className="w-14 h-14 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rounded-2xl flex items-center justify-center hover:bg-emerald-600 active:scale-95 transition-all">
           <PlusIcon size={24} />
        </button>
      </div>
    </div>
  );
}

// Removing custom SVG since we have lucide-react Plus as PlusIcon
