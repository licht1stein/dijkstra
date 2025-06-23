(module
  ;; Memory for storing graph data
  (memory (export "memory") 1)
  
  ;; Import console.log for debugging
  (import "console" "log" (func $log (param i32)))
  
  ;; Graph structure in memory:
  ;; - First 4 bytes: number of nodes
  ;; - Next 4 bytes: number of edges  
  ;; - Nodes: each node is 12 bytes (id:4, x:4, y:4)
  ;; - Edges: each edge is 12 bytes (from:4, to:4, weight:4)
  
  ;; Set number of nodes
  (func $set_node_count (param $count i32)
    (i32.store (i32.const 0) (local.get $count))
  )
  
  ;; Set number of edges
  (func $set_edge_count (param $count i32)
    (i32.store (i32.const 4) (local.get $count))
  )
  
  ;; Add a node at given memory offset
  (func $add_node (param $offset i32) (param $id i32) (param $x i32) (param $y i32)
    (i32.store (local.get $offset) (local.get $id))
    (i32.store (i32.add (local.get $offset) (i32.const 4)) (local.get $x))
    (i32.store (i32.add (local.get $offset) (i32.const 8)) (local.get $y))
  )
  
  ;; Add an edge at given memory offset
  (func $add_edge (param $offset i32) (param $from i32) (param $to i32) (param $weight i32)
    (i32.store (local.get $offset) (local.get $from))
    (i32.store (i32.add (local.get $offset) (i32.const 4)) (local.get $to))
    (i32.store (i32.add (local.get $offset) (i32.const 8)) (local.get $weight))
  )
  
  ;; Simple Dijkstra implementation
  ;; Returns offset to distances array in memory
  (func $dijkstra (param $start_id i32) (result i32)
    (local $node_count i32)
    (local $edge_count i32)
    (local $distances_offset i32)
    (local $visited_offset i32)
    (local $current_node i32)
    (local $min_dist i32)
    (local $i i32)
    (local $j i32)
    
    ;; Get node and edge counts
    (local.set $node_count (i32.load (i32.const 0)))
    (local.set $edge_count (i32.load (i32.const 4)))
    
    ;; Calculate memory offsets
    ;; distances start after header + nodes + edges
    (local.set $distances_offset 
      (i32.add 
        (i32.const 8) ;; header
        (i32.add
          (i32.mul (local.get $node_count) (i32.const 12)) ;; nodes
          (i32.mul (local.get $edge_count) (i32.const 12)) ;; edges
        )
      )
    )
    
    ;; visited array starts after distances
    (local.set $visited_offset 
      (i32.add (local.get $distances_offset) 
               (i32.mul (local.get $node_count) (i32.const 4)))
    )
    
    ;; Initialize distances to infinity (999999) and visited to false
    (local.set $i (i32.const 0))
    (loop $init_loop
      (i32.store 
        (i32.add (local.get $distances_offset) (i32.mul (local.get $i) (i32.const 4)))
        (i32.const 999999)
      )
      (i32.store 
        (i32.add (local.get $visited_offset) (i32.mul (local.get $i) (i32.const 4)))
        (i32.const 0)
      )
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $init_loop (i32.lt_u (local.get $i) (local.get $node_count)))
    )
    
    ;; Set distance to start node as 0
    (i32.store 
      (i32.add (local.get $distances_offset) (i32.mul (local.get $start_id) (i32.const 4)))
      (i32.const 0)
    )
    
    ;; Main Dijkstra loop - simplified version
    (local.set $i (i32.const 0))
    (loop $main_loop
      ;; Find unvisited node with minimum distance
      (local.set $current_node (i32.const -1))
      (local.set $min_dist (i32.const 999999))
      (local.set $j (i32.const 0))
      
      (loop $find_min
        (if (i32.eqz 
              (i32.load (i32.add (local.get $visited_offset) (i32.mul (local.get $j) (i32.const 4)))))
          (then
            (if (i32.lt_u 
                  (i32.load (i32.add (local.get $distances_offset) (i32.mul (local.get $j) (i32.const 4))))
                  (local.get $min_dist))
              (then
                (local.set $min_dist 
                  (i32.load (i32.add (local.get $distances_offset) (i32.mul (local.get $j) (i32.const 4)))))
                (local.set $current_node (local.get $j))
              )
            )
          )
        )
        (local.set $j (i32.add (local.get $j) (i32.const 1)))
        (br_if $find_min (i32.lt_u (local.get $j) (local.get $node_count)))
      )
      
      ;; If no unvisited node found, break
      (if (i32.eq (local.get $current_node) (i32.const -1))
        (then (br $main_loop))
      )
      
      ;; Mark current node as visited
      (i32.store 
        (i32.add (local.get $visited_offset) (i32.mul (local.get $current_node) (i32.const 4)))
        (i32.const 1)
      )
      
      (local.set $i (i32.add (local.get $i) (i32.const 1)))
      (br_if $main_loop (i32.lt_u (local.get $i) (local.get $node_count)))
    )
    
    ;; Return offset to distances array
    (local.get $distances_offset)
  )
  
  ;; Export functions
  (export "set_node_count" (func $set_node_count))
  (export "set_edge_count" (func $set_edge_count))
  (export "add_node" (func $add_node))
  (export "add_edge" (func $add_edge))
  (export "dijkstra" (func $dijkstra))
)