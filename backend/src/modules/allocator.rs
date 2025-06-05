use std::{
    alloc::{GlobalAlloc, Layout, System},
    sync::atomic::{AtomicUsize, Ordering},
    thread::{sleep, spawn},
    time::Duration,
};

// Global counters
pub static ALLOCATED: AtomicUsize = AtomicUsize::new(0);
pub static ALLOCATIONS: AtomicUsize = AtomicUsize::new(0);
pub static DEALLOCATIONS: AtomicUsize = AtomicUsize::new(0);

// Our custom allocator
struct CountingAllocator;

unsafe impl GlobalAlloc for CountingAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let size = layout.size();
        ALLOCATED.fetch_add(size, Ordering::SeqCst);
        ALLOCATIONS.fetch_add(1, Ordering::SeqCst);
        unsafe { System.alloc(layout) }
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        let size = layout.size();
        ALLOCATED.fetch_sub(size, Ordering::SeqCst);
        DEALLOCATIONS.fetch_add(1, Ordering::SeqCst);
        unsafe { System.dealloc(ptr, layout) };
    }
}

// Use our allocator as the global allocator
#[global_allocator]
static A: CountingAllocator = CountingAllocator;

//Prints amount of allocated memory and number of allocations since start every "duration" interval
pub fn allocated_auto_printer(duration: Duration) {
    spawn(move || {
        loop {
            let allocated = ALLOCATED.load(Ordering::SeqCst);
            let allocations = ALLOCATIONS.load(Ordering::SeqCst);
            let deallocations = DEALLOCATIONS.load(Ordering::SeqCst);
            println!(
                "Allocated Heap: {}, Allocations: {}, Deallocations: {}, Delta: {}",
                allocated,
                allocations,
                deallocations,
                allocations - deallocations
            );
            sleep(duration);
        }
    });
}
